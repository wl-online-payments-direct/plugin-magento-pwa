import { useCallback, useEffect, useState } from "react";
import DEFAULT_OPERATIONS  from '../worldLine.gql';
import mergeOperations from '@magento/peregrine/lib/util/shallowMerge';
import {
    useApolloClient,
    useLazyQuery,
    useMutation, useQuery
} from '@apollo/client';
import { useCartContext } from "@magento/peregrine/lib/context/cart";
import { paymentMethods } from "@worldline/worldline-payment/src/utils/constants";
import { clearCartDataFromCache } from "@magento/peregrine/lib/Apollo/clearCartDataFromCache";
import { CHECKOUT_STEP } from "@magento/peregrine/lib/talons/CheckoutPage/useCheckoutPage";
import { useUserContext } from "@magento/peregrine/lib/context/user";
import { useToasts } from "@magento/peregrine";

function isWorldlinePayment (type, code) {
    if (code.indexOf('worldline_redirect_payment') !== -1) {
        code = 'worldline_redirect_payment';
    }

    return paymentMethods[type].code.includes(code);
}

function getCode (array, code) {
    return array.find(element => element === code);
}

const wrapUseCheckoutPage = (original) => {
    return function useCreateAccount(...args) {
        const {
            handlePlaceOrder,
            orderNumber,
            checkoutStep,
            setCheckoutStep,
            ...restProps
        } = original(...args);

        const operations = mergeOperations(DEFAULT_OPERATIONS, args.operations);
        const {
            getRedirectUrl,
            getOrderDetailsQuery,
            getConfigWorldLine,
            worldlineHCPlaceOrderMutation,
            worldlineCCPlaceOrderMutation,
            worldlineRPPlaceOrderMutation,
            createCartMutation,
            updateSurchargeMutation
        } = operations;
        const [fetchRedirectUrl, { called,  data, loading }] = useLazyQuery(getRedirectUrl);
        const [, { addToast }] = useToasts();

        const [
            getOrderDetails,
            { data: orderDetailsData, loading: orderDetailsLoading }
        ] = useLazyQuery(getOrderDetailsQuery, {
            fetchPolicy: 'no-cache'
        });

        const { data: worldLineConfig } = useQuery(getConfigWorldLine,{
            fetchPolicy: 'no-cache'
        });

        const apolloClient = useApolloClient();
        const [fetchCartId] = useMutation(createCartMutation);
        const [updateSurchargeSummaryAmount] = useMutation(updateSurchargeMutation);

        // const [checkoutStep, setCheckoutStep] = useState(CHECKOUT_STEP.SHIPPING_ADDRESS);
        const [reviewOrderButtonClicked, setReviewOrderButtonClicked] = useState(false);
        const [isPlaceOrderWordlineDone, setIsPlaceOrderWordlineDone] = useState(false);

        const [{ isSignedIn }] = useUserContext();
        const [{ cartId }, { createCart, removeCart }] = useCartContext();

        const [paymentMethodCode, setPaymentMethodCode] = useState(null); // currently selected payment method code
        const [isSurchargeEnabled, setIsSurchargeEnabled] = useState(false); // surcharge should be enabled from the admin
        const [isSurchargeValid, setSurchargeValid] = useState(false); // surcharge should be rendered because of selected payment method
        const [isSurchargeCalculated, setIsSurchargeCalculated] = useState(false); // surcharge should be calculated by click on the surcharge-button

        const getPaymentMethodValue = (element) => {
            setPaymentMethodCode(element.target.value);
        }

        const checkIfPaymentMethodIsCart = (method) => {
            return method && getCode(paymentMethods.CC.code, method);
        }

        // Check / Setup if surcharge should be used at all
        const checkSurchargeStatus = (status) => {
            if (!status && !isSurchargeEnabled) {
                return true
            }

            if (typeof(status) === 'boolean') {
                setSurchargeValid(status);
            }

            return isSurchargeValid
        }

        // Check / Setup if surcharge was already calculated
        const checkSurchargeCalculated = (status) => {
            if (typeof(status) === 'boolean') {
                setIsSurchargeCalculated(status);
            }

            return isSurchargeCalculated;
        }

        const updateSurchargeSummarySection = () => {
            let method = paymentMethodCode || JSON.parse(localStorage.getItem('selectedPaymentMethod')).code;

            updateSurchargeSummaryAmount({
                variables: {
                    cartId,
                    selectedPaymentMethod: method
                }
            }).then((data) => {
                let surchargeAmount = data.data.updateSurchargeInformation.cart?.worldline_surcharging?.amount;

                if (checkIfPaymentMethodIsCart(method) && !surchargeAmount) {
                    checkSurchargeStatus(false);
                    checkSurchargeCalculated(false);
                }
            }).catch((error) => {
                console.log('surcharge error', error);
            }) ;
        };

        // update order summary section for surcharge
        // when it was calculated or payment method was changed
        const setShippingMethodDoneWorldline = useCallback(() => {
            if ((isSurchargeValid && paymentMethodCode) || isSurchargeCalculated) {
                updateSurchargeSummarySection();
            }

            if (checkoutStep === CHECKOUT_STEP.SHIPPING_METHOD) {
                setCheckoutStep(CHECKOUT_STEP.PAYMENT);
            }
        }, [checkoutStep, isSurchargeCalculated]);

        // Worldline PlaceOrder (no place order, just redirect to payment system)
        const [isPlacingOrderWorldline, setIsPlacingOrderWorldline] = useState(false);

        const handlePlaceOrderWorldline = useCallback(async () => {
             await getOrderDetails({
                variables: {
                    cartId
                }
            });
            setIsPlacingOrderWorldline(true);
        }, [cartId, getOrderDetails]);

        const customHandlePlaceOrder = useCallback(() => {
            const method = JSON.parse(localStorage.getItem('selectedPaymentMethod'));

            if (method && (
                isWorldlinePayment('HC', method.code)
                || isWorldlinePayment('CC', method.code)
                || isWorldlinePayment('RP', method.code))
            ) {
                handlePlaceOrderWorldline();
            } else {
                handlePlaceOrder();
            }
        }, [handlePlaceOrder, handlePlaceOrderWorldline]);

        const [
            worldlineHCPlaceOrder,
            {
                data: hc_data,
                error: hc_error,
                loading: hc_loading
            }
        ] = useMutation(worldlineHCPlaceOrderMutation);

        const [
            worldlineCCPlaceOrder,
            {
                data: cc_data,
                error: cc_error,
                loading: cc_loading
            }
        ] = useMutation(worldlineCCPlaceOrderMutation);

        const [
            worldlineRPPlaceOrder,
            {
                data: rp_data,
                error: rp_error,
                loading: rp_loading
            }
        ] = useMutation(worldlineRPPlaceOrderMutation);


        // follow changing payment method to toggle 'review order' button
        useEffect(() => {
            let isSurchargeEnabledFromConfig = worldLineConfig?.storeConfig?.worldline_is_apply_surcharge;
            let selectedPaymentMethodIsCart = checkIfPaymentMethodIsCart(paymentMethodCode);

            if (isSurchargeEnabledFromConfig) {
                checkSurchargeCalculated(false);
                setIsSurchargeEnabled(isSurchargeEnabledFromConfig);

                // enable 'review order' button and disable surcharge button
                checkSurchargeStatus(!(isSurchargeEnabledFromConfig && selectedPaymentMethodIsCart));
            }
        }, [paymentMethodCode]);

        useEffect(() => {
            if (!isSurchargeEnabled) {
                return
            }

            addToast({
                type: 'info',
                message: `Please note that a surcharge may be added to the amount you have to pay
                      depending on the payment method you have chosen.`,
                dismissable: true,
                timeout: false
            });
        },[addToast, isSurchargeEnabled]);

        useEffect(() => {
            async function placeOrderWorldline() {
                try {
                    localStorage.setItem('orderDetailsData', JSON.stringify(orderDetailsData));
                    const method = JSON.parse(localStorage.getItem('selectedPaymentMethod'));

                    if (method && isWorldlinePayment('HC', method.code)) {
                        await worldlineHCPlaceOrder({
                            variables: {
                                cartId
                            }
                        });
                    }

                    if (method && isWorldlinePayment('CC', method.code)) {
                        await worldlineCCPlaceOrder({
                            variables: {
                                cartId
                            }
                        });
                    }

                    if (method && isWorldlinePayment('RP', method.code)) {
                        let methodCode = method.code;

                        await worldlineRPPlaceOrder({
                            variables: {
                                cartId,
                                methodCode
                            }
                        });
                    }

                    if (isSignedIn) {
                        await removeCart();
                        await clearCartDataFromCache(apolloClient);
                    }

                    await createCart({
                        fetchCartId
                    });

                    setIsPlaceOrderWordlineDone(true);
                } catch (err) {
                    console.error(
                        'An error occurred during when placing the order',
                        err
                    );

                    setReviewOrderButtonClicked(false);
                    setCheckoutStep(CHECKOUT_STEP.PAYMENT);
                }
            }

            if (orderDetailsData && isPlacingOrderWorldline) {
                setIsPlacingOrderWorldline(false);
                placeOrderWorldline();
            }
        }, [
            isSignedIn,
            cartId,
            worldlineHCPlaceOrder,
            orderDetailsData,
            isPlacingOrderWorldline,
            removeCart,
            apolloClient,
            createCart,
            fetchCartId
        ]);

        useEffect(() => {
            if (hc_data && hc_data.processHCRedirectRequest && hc_data.processHCRedirectRequest.redirect_url && isPlaceOrderWordlineDone) {
                window.location = hc_data.processHCRedirectRequest.redirect_url;
            }
        },[hc_data, isPlaceOrderWordlineDone]);

        useEffect(() => {
            if (rp_data && rp_data.processRPRedirectRequest && rp_data.processRPRedirectRequest.redirect_url && isPlaceOrderWordlineDone) {
                window.location = rp_data.processRPRedirectRequest.redirect_url;
            }
        },[rp_data, isPlaceOrderWordlineDone]);

        useEffect(() => {
            if (cc_data && cc_data.processCCCreateRequest && isPlaceOrderWordlineDone) {

                if (cc_data.processCCCreateRequest.redirect_url) {
                    window.location = cc_data.processCCCreateRequest.redirect_url;
                }

                if (cc_data.processCCCreateRequest.redirect_url === '') {
                    const paymentId = JSON.parse(localStorage.getItem('hostedTokenizationId'));

                    window.location = `${window.location.origin}/worldline/success?paymentId=${paymentId}`;
                }
            }
        },[cc_data, isPlaceOrderWordlineDone]);

        // Venia Place Order
        useEffect(() => {
            if (data && data.checkRedirect && data.checkRedirect.url ){
                window.location = data.checkRedirect.url;
            }
        },[data]);

        useEffect(() => {
            if (orderNumber && !loading && !data) {
                const fetchData = async () => {
                    const response = await fetchRedirectUrl({
                        variables: {orderID: orderNumber},
                        fetchPolicy: 'network-only'
                    });
                }
                fetchData().catch(console.error);
            }
        },[original(...args), data]);

        return {
            checkRedirect: data
                && data.checkRedirect
                && data.checkRedirect.url
                && hc_data
                && hc_data.processHCRedirectRequest
                && hc_data.processHCRedirectRequest.redirect_url
                && rp_data
                && rp_data.processRPRedirectRequest
                && rp_data.processRPRedirectRequest.redirect_url
                && cc_data
                && cc_data.processCCCreateRequest
                && cc_data.processCCCreateRequest.redirect_url,
            orderNumber,
            orderDetailsData,
            customHandlePlaceOrder,
            isSurchargeValid,
            getPaymentMethodValue,
            checkSurchargeStatus,
            checkSurchargeCalculated,
            setShippingMethodDoneWorldline,
            ...restProps,
            checkoutStep,
            setCheckoutStep
        }
    };
};

export default wrapUseCheckoutPage;

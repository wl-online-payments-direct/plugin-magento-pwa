import { useCallback, useEffect, useState } from "react";
import DEFAULT_OPERATIONS  from '../worldLine.gql';
import mergeOperations from '@magento/peregrine/lib/util/shallowMerge';
import {
    useApolloClient,
    useLazyQuery,
    useMutation
} from '@apollo/client';
import { useCartContext } from "@magento/peregrine/lib/context/cart";
import { paymentMethods } from "@worldline/worldline-payment/src/utils/constants";
import { clearCartDataFromCache } from "@magento/peregrine/lib/Apollo/clearCartDataFromCache";
import { CHECKOUT_STEP } from "@magento/peregrine/lib/talons/CheckoutPage/useCheckoutPage";
import { useUserContext } from "@magento/peregrine/lib/context/user";

function isWorldlinePayment (type, code) {
    return paymentMethods[type].code.includes(code);
}

const wrapUseCheckoutPage = (original) => {
    return function useCreateAccount(...args) {
        const {
            handlePlaceOrder,
            orderNumber,
            ...restProps
        } = original(...args);
        const operations = mergeOperations(DEFAULT_OPERATIONS, args.operations);
        const {
            getRedirectUrl,
            getOrderDetailsQuery,
            worldlineHCPlaceOrderMutation,
            worldlineCCPlaceOrderMutation,
            createCartMutation
        } = operations;
        const [fetchRedirectUrl, { called,  data, loading }] = useLazyQuery(getRedirectUrl);

        const [
            getOrderDetails,
            { data: orderDetailsData, loading: orderDetailsLoading }
        ] = useLazyQuery(getOrderDetailsQuery, {
            fetchPolicy: 'no-cache'
        });

        const [fetchCartId] = useMutation(createCartMutation);
        const apolloClient = useApolloClient();

        const [reviewOrderButtonClicked, setReviewOrderButtonClicked] = useState(
            false
        );

        const [checkoutStep, setCheckoutStep] = useState(
            CHECKOUT_STEP.SHIPPING_ADDRESS
        );

        const [{ isSignedIn }] = useUserContext();
        const [{ cartId }, { createCart, removeCart }] = useCartContext();

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

            if (method && (isWorldlinePayment('HC', method.code) || isWorldlinePayment('CC', method.code))) {
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

                    if (isSignedIn) {
                        await removeCart();
                        await clearCartDataFromCache(apolloClient);
                    }

                    await createCart({
                        fetchCartId
                    });
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
            if (hc_data && hc_data.processHCRedirectRequest && hc_data.processHCRedirectRequest.redirect_url) {
                window.location = hc_data.processHCRedirectRequest.redirect_url;
            }
        },[hc_data]);

        useEffect(() => {
            if (cc_data && cc_data.processCCCreateRequest) {

                if (cc_data.processCCCreateRequest.redirect_url) {
                    window.location = cc_data.processCCCreateRequest.redirect_url;
                }

                if (cc_data.processCCCreateRequest.redirect_url === '') {
                    const paymentId = JSON.parse(localStorage.getItem('hostedTokenizationId'));

                    window.location = `${window.location.origin}/worldline/success?paymentId=${paymentId}&waitFetch=1`;
                }
            }
        },[cc_data]);

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
                && cc_data
                && cc_data.processCCCreateRequest
                && cc_data.processCCCreateRequest.redirect_url,
            orderNumber,
            orderDetailsData,
            customHandlePlaceOrder,
            ...restProps
        }
    };
};

export default wrapUseCheckoutPage;

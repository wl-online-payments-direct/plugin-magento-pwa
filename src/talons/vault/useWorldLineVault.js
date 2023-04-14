import { useCallback, useEffect, useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useUserContext } from "@magento/peregrine/lib/context/user";
import mergeOperations from '@magento/peregrine/lib/util/shallowMerge';
import DEFAULT_OPERATIONS from '../worldLine.gql';
import { useCartContext } from "@magento/peregrine/lib/context/cart";
import { useToasts } from "@magento/peregrine";

export const useWorldLineVault = props => {
    const [active, setActive] = useState(null);
    const [tokenizer, setTokenizer] = useState(null);
    const [tokenizerData, setTokenizerData] = useState(null);
    const [isScriptLoaded, setScriptLoad] = useState(null);
    const [isScriptError, setScriptError] = useState(null);
    const [isLoading, setIsLoading] = useState(null);
    const [configuration, setConfiguration] = useState(null);
    const [isSurchargeEnabled, setIsSurchargeEnabled] = useState(null);
    const [, { addToast }] = useToasts();

    const operations = mergeOperations(DEFAULT_OPERATIONS, {});
    const {
        getSavedPaymentMethod,
        setPaymentMethodVaultOnCartMutation,
        getConfigWorldLine
    } = operations;

    const {
        resetShouldSubmit,
        onPaymentSuccess,
        onPaymentError,
        shouldSubmit,
        isSurchargeValid,
        checkSurchargeStatus,
        checkSurchargeCalculated
    } = props;

    const [{ cartId }] = useCartContext();
    const [{ isSignedIn }] = useUserContext();
    const [
        updatePaymentMethod,
        {
            error: paymentMethodMutationError,
            called: paymentMethodMutationCalled,
            loading: paymentMethodMutationLoading
        }
    ] = useMutation(setPaymentMethodVaultOnCartMutation);

    const { data: worldLineConfig } = useQuery(getConfigWorldLine,{
        fetchPolicy: 'no-cache'
    });

    const { data, loading } = useQuery(
        getSavedPaymentMethod,
        {
            skip: !isSignedIn
        }
    );

    /**
     * This function will be called if cant not set address.
     */
    const onBillingAddressChangedError = useCallback(() => {
        resetShouldSubmit();
    }, [resetShouldSubmit]);

    useEffect(()=> {
        if (!window.Tokenizer) {
            const script = document.createElement('script');
            script.async = true;
            script.src_type = 'url';
            script.src = `https://payment.preprod.direct.worldline-solutions.com/hostedtokenization/js/client/tokenizer.min.js`;
            script.onload = () => setScriptLoad(true);
            script.onerror = () => setScriptError(true);
            document.body.appendChild(script);
        }

    },[])

    const initialForm = useCallback(({token, index, config}) =>{
        setIsSurchargeEnabled(worldLineConfig?.storeConfig?.worldline_is_apply_surcharge);
        const maintokenizer = new Tokenizer(
            config.getWorldlineConfig.url,
            'div-tokenization-'+index,
            {hideCardholderName: false, hideTokenFields:false},
            token
        );
        setTokenizer(maintokenizer);
        setIsLoading(true);
        maintokenizer.initialize()
            .then((e) => {
                setIsLoading(false);
            })
            .catch(({ message }) => {
                setIsLoading(false);
            })
    },[active, setTokenizer, tokenizer, worldLineConfig]);

    const handleClickActive = useCallback((token, index, config, publicHash) => {
        setActive({token, index, config, publicHash});

        if (isScriptLoaded || window.Tokenizer) {
            if (!active || active && active.token != token) {
                initialForm({token, index, config})
            }
        }
    },[setActive, isScriptLoaded, configuration, initialForm, active])

    /**
     * This function will be called if address was successfully set.
     */
    const onBillingAddressChangedSuccess = useCallback(() => {
        let submitReviewOrder = (data) => {
            updatePaymentMethod({
                variables: {
                    cartId,
                    hostedTokenizationId: data.hostedTokenizationId,
                    publicHash: active.publicHash,
                    colorDepth: window.screen.colorDepth.toString(),
                    javaEnabled: window.navigator.javaEnabled(),
                    locale: window.navigator.language.toString(),
                    screenHeight: window.screen.height.toString(),
                    screenWidth: window.screen.width.toString(),
                    timezoneOffsetUtcMinutes: (new Date()).getTimezoneOffset().toString()
                }
            });
        }

        if (tokenizerData) {
            submitReviewOrder(tokenizerData);

            return;
        }

        tokenizer.submitTokenization()
            .then((result) => {
                if (result.success) {
                    localStorage.setItem('hostedTokenizationId', JSON.stringify(result.hostedTokenizationId));
                    setTokenizerData(result);
                    submitReviewOrder(result);
                } else if (result.error) {
                    addToast({
                        type: 'error',
                        message: result.error.message,
                        timeout: 3000
                    });
                }
            })
            .catch((error) => {
                console.log('result.message error',error);

            })
            .finally(() => {
                //redirect to Success page
            });
    }, [updatePaymentMethod, cartId, tokenizer, data, active, tokenizerData]);


    useEffect(() => {
        const paymentMethodMutationCompleted =
            paymentMethodMutationCalled && !paymentMethodMutationLoading;

        if (paymentMethodMutationCompleted && !paymentMethodMutationError) {
            onPaymentSuccess();
        }

        if (paymentMethodMutationCompleted && paymentMethodMutationError) {
            onPaymentError();
        }
    }, [
        paymentMethodMutationError,
        paymentMethodMutationLoading,
        paymentMethodMutationCalled,
        onPaymentError,
        resetShouldSubmit
    ]);
    useEffect(()=>{
        if (paymentMethodMutationError) {
            addToast({
                type: 'error',
                message: paymentMethodMutationError.message,
                timeout: 3000
            });
        }
    },[paymentMethodMutationError, addToast])

    return {
        cards: data && data.customerPaymentTokens && data.customerPaymentTokens.items,
        isLoading: loading || isLoading,
        handleClickActive,
        onBillingAddressChangedError,
        onBillingAddressChangedSuccess,
        isSurchargeEnabled,
        tokenizer,
        setTokenizerData,
        tokenizerData,
        worldLineConfig,
        isSurchargeValid,
        checkSurchargeStatus,
        checkSurchargeCalculated
    };
};


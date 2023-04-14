import { useCallback, useEffect, useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import mergeOperations from '@magento/peregrine/lib/util/shallowMerge';
import { useCartContext } from '@magento/peregrine/lib/context/cart';
import DEFAULT_OPERATIONS from './worldLine.gql';
import { useToasts } from "@magento/peregrine";

export const useWorldLine = props => {
    const operations = mergeOperations(DEFAULT_OPERATIONS, props.operations);
    const [, { addToast }] = useToasts();
    const [isScriptLoaded, setScriptLoad] = useState(null);
    const [isScriptError, setScriptError] = useState(null);
    const [tokenizer, setTokenizer] = useState(null);
    const [tokenizerData, setTokenizerData] = useState(null);
    const [isLoading, setIsLoading] = useState(null);
    const [isSurchargeEnabled, setIsSurchargeEnabled] = useState(null);

    const {
        getConfigWorldLine,
        setPaymentMethodOnCartMutation
    } = operations;

    const [{ cartId }] = useCartContext();
    const { data: worldLineConfig, loading } = useQuery(getConfigWorldLine,{
        fetchPolicy: 'no-cache'
    });

    const {
        resetShouldSubmit,
        onPaymentSuccess,
        onPaymentError,
        shouldSubmit,
        isSurchargeValid,
        checkSurchargeStatus,
        checkSurchargeCalculated
    } = props;

    const [
        updatePaymentMethod,
        {
            error: paymentMethodMutationError,
            called: paymentMethodMutationCalled,
            loading: paymentMethodMutationLoading
        }
    ] = useMutation(setPaymentMethodOnCartMutation);

    const initialForm = useCallback(() => {
        const maintokenizer = new Tokenizer(
            worldLineConfig.getWorldlineConfig.url, 'div-hosted-tokenization', { hideCardholderName: false }
        );

        setIsSurchargeEnabled(worldLineConfig?.storeConfig?.worldline_is_apply_surcharge);
        setTokenizer(maintokenizer);
        setIsLoading(true);

        maintokenizer.initialize()
            .then((e) => {
                setIsLoading(false);
            })
            .catch(({ message }) => {
                setIsLoading(false);
                addToast({
                    type: 'error',
                    message: message,
                    timeout: 3000
                });
            })
    },[setTokenizer, worldLineConfig, onPaymentError, addToast]);

    /**
     * This function will be called if cant not set address.
     */
    const onBillingAddressChangedError = useCallback(() => {
        resetShouldSubmit();
    }, [resetShouldSubmit]);

    /**
     * This function will be called if address was successfully set.
     */
    const onBillingAddressChangedSuccess = useCallback(async () => {
        let submitReviewOrder = (data) => {
            updatePaymentMethod({
                variables: {
                    cartId,
                    hostedTokenizationId: data.hostedTokenizationId,
                    isActivePaymentTokenEnabler: !!Number(worldLineConfig.storeConfig.worldline_cc_vault_active),
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
                    console.log('result.message',result.message);
                }
            })
            .catch((error) => {
                console.log('result.message error',error);
            })
            .finally(() => {
                //redirect to Success page
            });
    }, [updatePaymentMethod, cartId, tokenizer, worldLineConfig, tokenizerData]);

    useEffect(()=> {
        const script = document.createElement('script');

        script.async = true;
        script.src_type = 'url';
        script.src = `https://payment.preprod.direct.worldline-solutions.com/hostedtokenization/js/client/tokenizer.min.js`;
        script.onload = () => setScriptLoad(true);
        script.onerror = () => setScriptError(true);
        document.body.appendChild(script);
    },[])

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

    useEffect(()=> {
        if (isScriptLoaded && worldLineConfig && worldLineConfig.getWorldlineConfig.url) {
            initialForm()
        }

    },[isScriptLoaded, worldLineConfig, initialForm]);

    return {
        isLoading: loading || isLoading,
        errorScriptLoading: isScriptError,
        onBillingAddressChangedError,
        onBillingAddressChangedSuccess,
        isSurchargeEnabled,
        tokenizer,
        tokenizerData,
        setTokenizerData,
        isSurchargeValid,
        checkSurchargeStatus,
        checkSurchargeCalculated,
        worldLineConfig
    };
};


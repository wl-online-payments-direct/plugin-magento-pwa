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
    const [isLoading, setIsLoading] = useState(null);

    const {
        getConfigWorldLine,
        setPaymentMethodOnCartMutation
    } = operations;

    const [{ cartId }] = useCartContext();
    const { data: worldLineConfig, loading } = useQuery(getConfigWorldLine,{
        fetchPolicy: 'no-cache'
    });

    const { resetShouldSubmit, onPaymentSuccess, onPaymentError, shouldSubmit } = props;

    const [
        updatePaymentMethod,
        {
            error: paymentMethodMutationError,
            called: paymentMethodMutationCalled,
            loading: paymentMethodMutationLoading
        }
    ] = useMutation(setPaymentMethodOnCartMutation);

    const initialForm = useCallback(() =>{
        const maintokenizer = new Tokenizer(worldLineConfig.getWorldlineConfig.url, 'div-hosted-tokenization', {hideCardholderName: false});
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
        tokenizer.submitTokenization()
            .then((result) => {
                if (result.success) {
                    const data =  updatePaymentMethod({
                        variables: { cartId, hostedTokenizationId: result.hostedTokenizationId, isActivePaymentTokenEnabler: !!worldLineConfig.storeConfig.worldline_cc_vault_active  }
                    });
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
    }, [updatePaymentMethod, cartId, tokenizer, worldLineConfig]);

    useEffect(()=> {
        const script = document.createElement('script');
        script.async = true;
        script.src_type = 'url';
        script.src = `https://payment.preprod.direct.ingenico.com/hostedtokenization/js/client/tokenizer.min.js`;
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
        onBillingAddressChangedSuccess
    };
};


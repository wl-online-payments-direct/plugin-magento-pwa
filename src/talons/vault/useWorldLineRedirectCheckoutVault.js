import { useCallback, useEffect, useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useUserContext } from "@magento/peregrine/lib/context/user";
import mergeOperations from '@magento/peregrine/lib/util/shallowMerge';
import DEFAULT_OPERATIONS from '../worldLine.gql';
import { useCartContext } from "@magento/peregrine/lib/context/cart";
import { useToasts } from "@magento/peregrine";

export const useWorldLineRedirectCheckoutVault = props => {
    const [active, setActive] = useState(null);
    const [tokenizer, setTokenizer] = useState(null);
    const [isLoading, setIsLoading] = useState(null);
    const [configuration, setConfiguration] = useState(null);
    const [, { addToast }] = useToasts();

    const operations = mergeOperations(DEFAULT_OPERATIONS, {});
    const {
        getSavedPaymentMethod,
        setPaymentRedirectCheckoutVaultOnCartMutation
    } = operations;

    const { resetShouldSubmit, onPaymentSuccess, onPaymentError, shouldSubmit, paymentCode } = props;

    const [{ cartId }] = useCartContext();
    const [{ isSignedIn }] = useUserContext();

    const [
        updatePaymentMethod,
        {
            error: paymentMethodMutationError,
            called: paymentMethodMutationCalled,
            loading: paymentMethodMutationLoading
        }
    ] = useMutation(setPaymentRedirectCheckoutVaultOnCartMutation);

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

    const handleClickActive = useCallback((token, index, publicHash) => {
        setActive({token, index, publicHash});
    },[setActive])

    /**
     * This function will be called if address was successfully set.
     */
    const onBillingAddressChangedSuccess = useCallback(() => {
        updatePaymentMethod({
            variables: {
                cartId,
                paymentCode: paymentCode,
                publicHash: active.publicHash,
                colorDepth: window.screen.colorDepth.toString(),
                javaEnabled: window.navigator.javaEnabled(),
                locale: window.navigator.language.toString(),
                screenHeight: window.screen.height.toString(),
                screenWidth: window.screen.width.toString(),
                timezoneOffsetUtcMinutes: (new Date()).getTimezoneOffset().toString()
            }
        });
    }, [updatePaymentMethod, cartId, data, active, paymentCode]);

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
        onBillingAddressChangedSuccess
    };
};


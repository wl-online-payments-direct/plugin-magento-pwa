import { useCallback, useEffect } from 'react';
import { useMutation } from '@apollo/client';
import mergeOperations from '@magento/peregrine/lib/util/shallowMerge';
import DEFAULT_OPERATIONS from './worldLine.gql';
import { useCartContext } from '@magento/peregrine/lib/context/cart';

export const useWorldLineRedirectPayment = props => {
    const operations = mergeOperations(DEFAULT_OPERATIONS);
    const { setPaymentMethodRedirectPayment } = operations;
    const {
        resetShouldSubmit,
        onPaymentSuccess,
        onPaymentError,
        paymentCode
    } = props;
    const [{ cartId }] = useCartContext();

    const [
        updatePaymentMethod,
        {
            error: paymentMethodMutationError,
            called: paymentMethodMutationCalled,
            loading: paymentMethodMutationLoading
        }
    ] = useMutation(setPaymentMethodRedirectPayment);

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
        await updatePaymentMethod({
            variables: {
                cartId,
                paymentCode: paymentCode,
                paymentId: +paymentCode.replace(/\D/g, ''),
                colorDepth: window.screen.colorDepth.toString(),
                javaEnabled: window.navigator.javaEnabled(),
                locale: window.navigator.language.toString(),
                screenHeight: window.screen.height.toString(),
                screenWidth: window.screen.width.toString(),
                timezoneOffsetUtcMinutes: (new Date()).getTimezoneOffset().toString()
            }
        });
    }, [updatePaymentMethod, cartId, paymentCode]);

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
    return {
        isLoading: paymentMethodMutationLoading,
        onBillingAddressChangedError,
        onBillingAddressChangedSuccess
    };
};

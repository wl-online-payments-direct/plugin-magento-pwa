import { useCallback, useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import mergeOperations from '@magento/peregrine/lib/util/shallowMerge';
import DEFAULT_OPERATIONS from './worldLine.gql';
import { useCartContext } from "@magento/peregrine/lib/context/cart";

export const useWorldLineHostedCheckout = props => {
    const operations = mergeOperations(DEFAULT_OPERATIONS);
    const { setPaymentMethodHostedCheckout } = operations;
    const { resetShouldSubmit, onPaymentSuccess, onPaymentError, shouldSubmit } = props;
    const [{ cartId }] = useCartContext();


    const [
        updatePaymentMethod,
        {
            error: paymentMethodMutationError,
            called: paymentMethodMutationCalled,
            loading: paymentMethodMutationLoading
        }
    ] = useMutation(setPaymentMethodHostedCheckout);

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
                    cartId
                }
            });

    }, [updatePaymentMethod, cartId]);

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


import {useCallback, useMemo} from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { useCartContext } from '@magento/peregrine/lib/context/cart';
import mergeOperations from '@magento/peregrine/lib/util/shallowMerge';
import DEFAULT_OPERATIONS from './priceSummary.gql';

const flattenData = data => {
    if (!data) return {};
    return {
        subtotal: data.cart.prices.subtotal_excluding_tax,
        total: data.cart.prices.grand_total,
        discounts: data.cart.prices.discounts,
        giftCards: data.cart.applied_gift_cards,
        giftOptions: data.cart.prices.gift_options,
        taxes: data.cart.prices.applied_taxes,
        shipping: data.cart.shipping_addresses,
        surcharge: data.cart.worldline_surcharging
    };
};

const useWlPriceSummary = (props = {}) => {
    const { orderData } = props;
    const operations = mergeOperations(DEFAULT_OPERATIONS, props.operations);
    const { getPriceSummaryQuery } = operations;

    const [{ cartId }] = useCartContext();
    const history = useHistory();
    // We don't want to display "Estimated" or the "Proceed" button in checkout.
    const match = useRouteMatch('/checkout');
    const isCheckout = !!match;

    const { error, loading, data: queryData } = useQuery(getPriceSummaryQuery, {
        fetchPolicy: 'cache-and-network',
        nextFetchPolicy: 'cache-first',
        skip: !cartId || orderData,
        variables: {
            cartId
        }
    });

    const data = useMemo(() => orderData || queryData, [orderData, queryData]);

    const handleProceedToCheckout = useCallback(() => {
        history.push('/checkout');
    }, [history]);

    const handleEnterKeyPress = useCallback(() => {
        event => {
            if (event.key === 'Enter') {
                handleProceedToCheckout();
            }
        };
    }, [handleProceedToCheckout]);

    return {
        handleProceedToCheckout,
        handleEnterKeyPress,
        hasError: !!error,
        hasItems: data && !!data.cart.items.length,
        isCheckout,
        isLoading: !!loading,
        flatData: flattenData(data)
    };
};

export default useWlPriceSummary

import { useCallback, useEffect, useState } from 'react';
import { useLazyQuery } from '@apollo/client';
import mergeOperations from '@magento/peregrine/lib/util/shallowMerge';
import DEFAULT_OPERATIONS from './worldLine.gql';
import { useCartContext } from '@magento/peregrine/lib/context/cart';

export const useCartInfo = props => {
    const operations = mergeOperations(DEFAULT_OPERATIONS);
    const { code, attribute } = props;
    const { getCartInfo } = operations;
    const [{ cartId }] = useCartContext();
    const [cartInfo, setCartInfo] = useState();
    const [getInfo, { called, data, loading }] = useLazyQuery(getCartInfo);

    useEffect(() => {
        getInfo({
            variables: {
                cartId
            }
        });

        setCartInfo(getList());
    }, [getInfo, cartId, data]);

    const getList = useCallback(() => {
        if (data) {
            for (let item of data.cart.available_payment_methods) {
                if (item.code === code) {
                    return item[attribute];
                }
            }
        }
    }, [data]);

    return {
        cartInfo
    };
};

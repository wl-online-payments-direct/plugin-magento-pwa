import { useCallback, useEffect, useState } from 'react';
import { useLazyQuery } from '@apollo/client';
import mergeOperations from '@magento/peregrine/lib/util/shallowMerge';
import DEFAULT_OPERATIONS from './worldLine.gql';
import { useCartContext } from "@magento/peregrine/lib/context/cart";

export const useIconsList = props => {
    const operations = mergeOperations(DEFAULT_OPERATIONS);
    const { getCartInfo } = operations;
    const [{ cartId }] = useCartContext();
    const [iconsList, setIconsList] = useState()
    const [icons, { called,  data, loading }] = useLazyQuery(getCartInfo);

    useEffect( ()=> {
        icons({
            variables: {
                cartId
            }
        });

        setIconsList(getIconsList());
    },[icons, cartId, data]);

    const getIconsList = useCallback(() => {
        if (data) {
            for (let item of data.cart.available_payment_methods) {
                if (item.code === props.code) {
                    return item.icons;
                }
            }
        }
    }, [data]);

    return {
        iconsList
    };
};


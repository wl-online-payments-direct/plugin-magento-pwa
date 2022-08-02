import { useEffect } from "react";
import DEFAULT_OPERATIONS  from '../worldLine.gql';
import mergeOperations from '@magento/peregrine/lib/util/shallowMerge';
import { useLazyQuery } from "@apollo/client";

const wrapUseCheckoutPage = (original) => {
    return function useCreateAccount(...args) {
        const {orderNumber, ...restProps} = original(...args);
        const operations = mergeOperations(DEFAULT_OPERATIONS, args.operations);
        const {
            getRedirectUrl
        } = operations;
        const [fetchRedirectUrl, { called,  data, loading }] = useLazyQuery(getRedirectUrl);

        useEffect(()=>{
            if (data && data.checkRedirect && data.checkRedirect.url ){
                window.location = data.checkRedirect.url;
            }
        },[data]);


        useEffect(()=> {
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
            checkRedirect: data && data.checkRedirect && data.checkRedirect.url,
            orderNumber,
            ...restProps

        }
    };
};

export default wrapUseCheckoutPage;

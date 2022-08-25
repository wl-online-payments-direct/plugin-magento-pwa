import { useEffect, useState } from "react";
import DEFAULT_OPERATIONS  from '../worldLine.gql';
import mergeOperations from '@magento/peregrine/lib/util/shallowMerge';
import { useLazyQuery } from "@apollo/client";
import { useLocation } from "react-router-dom";
import { paymentMethods } from "@worldline/worldline-payment/src/utils/constants";

const useSuccess = () => {
    const operations = mergeOperations(DEFAULT_OPERATIONS);
    const selectedPaymentMethod = JSON.parse(localStorage.getItem('selectedPaymentMethod'));
    const code = selectedPaymentMethod && selectedPaymentMethod.code;
    const [ sendedRequest, setSendedRequest ] = useState(false);
    const { search } = useLocation();
    const queryParams = new URLSearchParams(search);
    const [ type, setType ] = useState('');

    const {
        processCCResult,
        processHCResult
    } = operations;

    const getMethod = () => {
        switch (code) {
            case getCode(paymentMethods.HC.code, code):
                return processHCResult;
            case getCode(paymentMethods.CC.code, code):
                return processCCResult;
        }
    }

    const getCode = (array, code) => {
        return array.find(element => element === code);
    }

    if (!code) {
        return {};
    }

    const [ fetchProcessHosted, { called, data, loading } ] = useLazyQuery(getMethod());

    useEffect(() => {
        switch (code) {
            case getCode(paymentMethods.HC.code, code):
                setType(paymentMethods.HC.query);
                break;
            case getCode(paymentMethods.CC.code, code):
                setType(paymentMethods.CC.query);
                break;
        }

        if (!sendedRequest && queryParams.get('hostedCheckoutId') || !sendedRequest && queryParams.get('paymentId')) {
            setTimeout(() => {
                fetchProcessHosted({
                    variables: {
                        paymentId: queryParams.get('hostedCheckoutId') || queryParams.get('paymentId'),
                        mac: queryParams.get('RETURNMAC') || ''
                    },
                });
                setSendedRequest(true);
            }, queryParams.get('waitFetch') === '1' ? 2000 : 0); // wait until order being created on backend
        }
    },[queryParams, fetchProcessHosted, setSendedRequest])

    return {
        orderIncrementId: data && data[type] && data[type].orderIncrementId,
        result: data && data[type] && data[type].result,
        sendedRequest,
        loading
    }
};

export default useSuccess;

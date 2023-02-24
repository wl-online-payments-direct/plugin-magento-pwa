import { useEffect, useState } from 'react';
import DEFAULT_OPERATIONS from '../worldLine.gql';
import mergeOperations from '@magento/peregrine/lib/util/shallowMerge';
import { useLazyQuery } from '@apollo/client';
import { useLocation } from 'react-router-dom';
import { paymentMethods } from '@worldline/worldline-payment/src/utils/constants';

const FETCH_TIMEOUT = 1000;
const FETCH_ITERATIONS = 15;

const MULTIBANKO_CODE = 5500;

const useSuccess = () => {
    const operations = mergeOperations(DEFAULT_OPERATIONS);
    const selectedPaymentMethod = JSON.parse(
        localStorage.getItem('selectedPaymentMethod')
    );
    const code = selectedPaymentMethod && selectedPaymentMethod.code;
    const { search } = useLocation();
    const queryParams = new URLSearchParams(search);
    const [type, setType] = useState('');
    const [counter, setCounter] = useState(0);
    const [isCheckingOrder, setIsCheckingOrder] = useState(false);
    const [isOrder, setIsOrder] = useState(false);
    const [status, setStatus] = useState('');
    const [incrementId, setIncrementId] = useState(null);
    const [methodCode, setMethodCode] = useState(null);
    const [paymentProductId, setPaymentProductId] = useState(null);

    const {
        processCCResult,
        processHCResult,
        processRPResult,
        checkOrderQuery,
        pendingOrderQuery,
        createCartMutation
    } = operations;

    const getPureMethod = (code) => {
        return code.indexOf('worldline_redirect_payment') === 0 ? 'worldline_redirect_payment' : code;
    };

    const isMultibanko = code.indexOf('_' + MULTIBANKO_CODE) !== -1;

    const getMethod = () => {
        let pureCode = getPureMethod(code);

        switch (pureCode) {
            case getCode(paymentMethods.RP.code, pureCode):
                return processRPResult;
            case getCode(paymentMethods.HC.code, pureCode):
                return processHCResult;
            case getCode(paymentMethods.CC.code, pureCode):
                return processCCResult;
        }
    };

    const getCode = (array, code) => {
        return array.find(element => element === code);
    };

    if (!code) {
        return {};
    }

    const [fetchProcess, { called: processResultSent, data, loading }] = useLazyQuery(getMethod());
    const [
        checkOrder,
        {
            data: checkOrderData
        }
    ] = useLazyQuery(checkOrderQuery);
    const [
        processPendingOrder,
        {
            called: pendingOrderCalled,
            data: pendingOrderData
        }
    ] = useLazyQuery(pendingOrderQuery);

    useEffect(() => {
        let pureCode = getPureMethod(code);

        switch (pureCode) {
            case getCode(paymentMethods.HC.code, pureCode):
                setType(paymentMethods.HC.query);
                break;
            case getCode(paymentMethods.CC.code, pureCode):
                setType(paymentMethods.CC.query);
                break;
            case getCode(paymentMethods.RP.code, pureCode):
                setType(paymentMethods.RP.query);
                break;
        }

        if (
            (!processResultSent && queryParams.get('hostedCheckoutId')) ||
            (!processResultSent && queryParams.get('paymentId'))
        ) {
            fetchProcess({
                variables: {
                    paymentId: queryParams.get('hostedCheckoutId') || queryParams.get('paymentId'),
                    mac: queryParams.get('RETURNMAC') || ''
                },
            });

        }
    }, [queryParams, fetchProcess]);

    useEffect(() => {
        if (isCheckingOrder && !isOrder) {
            if (counter < FETCH_ITERATIONS) {
                setTimeout(() => {
                    // fetch checkOrder query
                    checkOrder({
                        variables: {
                            incrementId: incrementId
                        }
                    });

                    setCounter(count => count + 1);
                }, FETCH_TIMEOUT);
            } else {
                // fetch processPendingOrder query
                processPendingOrder({
                    variables: {
                        incrementId: incrementId
                    }
                });
            }
        }
    }, [isCheckingOrder, isOrder, counter]);

    // Listen for process result query data
    useEffect(() => {
        if (data && data[type]) {
            setStatus(data[type].result);
        }

        if (data && data[type] && data[type].orderIncrementId) {
            setIncrementId(data[type].orderIncrementId);
        }

        if (data && data[type] && data[type].methodCode) {
            setMethodCode(data[type].methodCode);
        }

        if (data && data[type] && data[type].paymentProductId) {
            setPaymentProductId(data[type].paymentProductId);
        }

        if (data && data[type] && data[type].result === 'waiting') {
            setIsCheckingOrder(true);
        }
    }, [data]);

    // Listen for checkOrder query data
    useEffect(() => {
        if (checkOrderData && checkOrderData.checkOrder) {
            setIsOrder(true);
            setStatus('success');
        }
    }, [checkOrderData]);

    // Listen for processPendingOrder query data
    useEffect(() => {
        if (!pendingOrderCalled) {
            return;
        }

        if (pendingOrderData) {
            setStatus(pendingOrderData.processPendingOrder ? 'success' : 'fail');
        }
    }, [pendingOrderData, pendingOrderCalled]);

    return {
        orderIncrementId: incrementId,
        status: status,
        methodCode: methodCode,
        paymentProductId: paymentProductId,
        processResultSent,
        pendingOrderCalled,
        loading,
        createCartMutation,
        isMultibanko
    };
};

export default useSuccess;

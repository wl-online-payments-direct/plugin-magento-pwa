import React, {useCallback, useEffect, useState} from 'react';
import { useToasts } from "@magento/peregrine";
import mergeOperations from '@magento/peregrine/lib/util/shallowMerge';
import DEFAULT_OPERATIONS from './worldLine.gql';
import {useMutation} from "@apollo/client";
import {useCartContext} from "@magento/peregrine/lib/context/cart";
import useFieldState from "@magento/peregrine/lib/hooks/hook-wrappers/useInformedFieldStateWrapper";
import { paymentMethods } from "@worldline/worldline-payment/src/utils/constants";
import {useIntl} from "react-intl";
import Price from "@magento/venia-ui/lib/components/Price";

export const useSurcharge = props => {
    const operations = mergeOperations(DEFAULT_OPERATIONS, props.operations);
    const [, { addToast }] = useToasts();
    const [{ cartId }] = useCartContext();
    const { formatMessage } = useIntl();

    const {
        calculateSurchargeMutation
    } = operations;

    const {
        tokenizer,
        tokenizerData,
        setTokenizerData,
        worldLineConfig,
        isSurchargeValid,
        checkSurchargeStatus,
        checkSurchargeCalculated
    } = props;

    const [calculateSurcharge] = useMutation(calculateSurchargeMutation);
    const [isDisabled, setIsDisabled] = useState(false);
    const [surchargeMessage, setSurchargeMessage] = useState(null);

    const { value: currentSelectedPaymentMethod } = useFieldState(
        'selectedPaymentMethod'
    );
    const getCode = (array, code) => {
        return array.find(element => element === code);
    };

    // if the payment method was preselected and cached we need to enable surcharge button right after page is ready
    useEffect(() => {
        if (!checkSurchargeCalculated()) {
            let isSurchargeEnabled = worldLineConfig?.storeConfig?.worldline_is_apply_surcharge;
            let selectedPaymentMethodIsCart = currentSelectedPaymentMethod
                && getCode(paymentMethods.CC.code, currentSelectedPaymentMethod); // check if CC payment method was selected

            checkSurchargeStatus(!(isSurchargeEnabled && selectedPaymentMethodIsCart));
        }
    }, [currentSelectedPaymentMethod])

    /**
     * Calculate Surcharge
     * @type {(function(): Promise<void>)|*}
     */
    const handleCalculateSurcharge = useCallback(async () => {
        let submitSurchargeCalculation = (data) => {
            calculateSurcharge({
                variables: {
                    cartId,
                    hostedTokenizationId: data.hostedTokenizationId
                }
            }).then(result => {
                let surchargeAmount = result.data?.calculateSurcharge?.surcharging;

                if (surchargeAmount) {
                    let surchargeSuccessMessage = `Surcharge amount: ${surchargeAmount}`;

                    setSurchargeMessage(surchargeSuccessMessage);
                    checkSurchargeCalculated(true); // set isSurchargeCalculated to true

                    addToast({
                        type: 'success',
                        message: formatMessage({
                            id: 'checkoutPage.surchargeAmount',
                            defaultMessage: surchargeSuccessMessage
                        }),
                        dismissable: true,
                        timeout: false
                    });
                }
            })
            .catch((error) => {
                errorHandler(error);
            });
        }

        // error handler
        let errorHandler = (error) => {
            let message = error?.message || error;

            console.log('result.message error', message);

            addToast({
                type: 'error',
                message: `Something went wrong. Please try again later`,
                timeout: 6000
            });
        }

        // only surcharge calculation if tokenizer was already submitted
        if (tokenizerData) {
            submitSurchargeCalculation(tokenizerData);
            checkSurchargeStatus(true);

            return;
        }

        // submit tokenizer if it wasn't
        tokenizer.submitTokenization()
            .then((result) => {
                if (result.success) {
                    localStorage.setItem('hostedTokenizationId', JSON.stringify(result.hostedTokenizationId));
                    setTokenizerData(result);
                    submitSurchargeCalculation(result);
                    checkSurchargeStatus(true);
                } else if (result.error) {
                    errorHandler(result);
                }
            })
            .catch((error) => {
                errorHandler(error);
            })
    }, [cartId, tokenizer, tokenizerData, worldLineConfig]);

    useEffect(() => {
        setIsDisabled(isSurchargeValid);
    }, [isSurchargeValid])

    return {
        surchargeMessage,
        isDisabled: isDisabled,
        handleCalculateSurcharge: handleCalculateSurcharge
    };
};


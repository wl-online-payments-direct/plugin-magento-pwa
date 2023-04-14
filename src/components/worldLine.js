import React from 'react';
import { useStyle } from '@magento/venia-ui/lib/classify';
import { shape, string, bool, func } from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { useWorldLine } from "@worldline/worldline-payment/src/talons/useWorldLine";
import LoadingIndicator from "@magento/venia-ui/lib/components/LoadingIndicator";
import defaultClasses from './worldline.module.css'
import BillingAddress from '@magento/venia-ui/lib/components/CheckoutPage/BillingAddress';
import SurchargeButton from "./Surcharge";

const WorldLine = props => {
    const classes = useStyle(defaultClasses, props.classes);

    const {
        isLoading,
        errorScriptLoading,
        onBillingAddressChangedError,
        onBillingAddressChangedSuccess,
        isSurchargeEnabled,
        tokenizer,
        tokenizerData,
        setTokenizerData,
        worldLineConfig,
        isSurchargeValid,
        checkSurchargeStatus,
        checkSurchargeCalculated
    } = useWorldLine(props);

    return (
        <>
            <div id="div-hosted-tokenization"></div>
            {isSurchargeEnabled && (
                <SurchargeButton
                    tokenizer={tokenizer}
                    tokenizerData={tokenizerData}
                    setTokenizerData={setTokenizerData}
                    worldLineConfig={worldLineConfig}
                    checkSurchargeStatus={checkSurchargeStatus}
                    isSurchargeValid={isSurchargeValid}
                    checkSurchargeCalculated={checkSurchargeCalculated}
                />
            )}

            {!isLoading && !errorScriptLoading && (
                <BillingAddress
                    resetShouldSubmit={props.resetShouldSubmit}
                    shouldSubmit={props.shouldSubmit}
                    onBillingAddressChangedError={onBillingAddressChangedError}
                    onBillingAddressChangedSuccess={onBillingAddressChangedSuccess}
                />
            )}
            { !isLoading && errorScriptLoading &&
                <div className={classes.errorMessages}>
                    <FormattedMessage
                        id={'checkoutPage.paymentLoadingError'}
                    />
                </div>
            }
            {isLoading && !errorScriptLoading && (
                <LoadingIndicator classes={{ root: classes.loading }}>
                    <FormattedMessage
                        id={'checkoutPage.loadingPaymentInformation'}
                        defaultMessage={'Fetching Payment Information'}
                    />
                </LoadingIndicator>
            )}
        </>

    );
};

WorldLine.propTypes = {
    classes: shape({ root: string }),
    payableTo: string,
    mailingAddress: string,
    shouldSubmit: bool.isRequired,
    onPaymentSuccess: func,
    onPaymentReady: func,
    onPaymentError: func,
    resetShouldSubmit: func.isRequired
};

WorldLine.defaultProps = {
    payableTo: 'Venia Inc',
    mailingAddress: 'Venia Inc\r\nc/o Payment\r\nPO 122334\r\nAustin Texas'
};

export default WorldLine;

import React from 'react';
import defaultClasses from './surchargeButton.module.css';
import Button from '@magento/venia-ui/lib/components/Button';
import { FormattedMessage } from 'react-intl';
import { useSurcharge } from "@worldline/worldline-payment/src/talons/useSurcharge";
import { useStyle } from '@magento/venia-ui/lib/classify';

const SurchargeButton = (props) => {
    const {
        classes: propClasses,
        tokenizer,
        tokenizerData,
        setTokenizerData,
        worldLineConfig,
        isSurchargeValid,
        checkSurchargeStatus,
        checkSurchargeCalculated,
        public_hash
    } = props;

    const talonProps = useSurcharge({
        tokenizer: tokenizer,
        paymentHash: public_hash,
        tokenizerData: tokenizerData,
        setTokenizerData: setTokenizerData,
        checkSurchargeStatus: checkSurchargeStatus,
        isSurchargeValid: isSurchargeValid,
        checkSurchargeCalculated: checkSurchargeCalculated,
        worldLineConfig: worldLineConfig
    });

    const {
        surchargeMessage,
        handleCalculateSurcharge,
        isDisabled
    } = talonProps;

    const classes = useStyle(defaultClasses, propClasses);

    return (
        <div className={classes.surchargeButton}>
            {
                (checkSurchargeCalculated() && surchargeMessage) &&
                <div className={classes.surchargeData}>
                    <FormattedMessage
                        id={'checkoutPage.surchargeCcMessage'}
                        defaultMessage={surchargeMessage}
                    />
                </div>
            }

            <Button
                onClick={handleCalculateSurcharge}
                negative={false}
                disabled={isDisabled}
                priority="normal"
                type="button"
            >
                <FormattedMessage
                    id={'checkoutPage.surchargeCcButton'}
                    defaultMessage={'Get surcharge amount'}
                />
            </Button>
        </div>
    );
};

export default SurchargeButton;

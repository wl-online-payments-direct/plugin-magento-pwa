import React, { Fragment, useCallback, useState } from 'react';
import { useStyle } from '@magento/venia-ui/lib/classify';
import { shape, string, bool, func } from 'prop-types';
import { FormattedMessage } from "react-intl";
import { useWorldLineRedirectCheckoutVault } from "@worldline/worldline-payment/src/talons/vault/useWorldLineRedirectCheckoutVault";
import defaultClasses from './worldlineVault.module.css'
import BillingAddress from '@magento/venia-ui/lib/components/CheckoutPage/BillingAddress';
import { getCardImages } from "@worldline/worldline-payment/src/utils/constants";

const WorldLineRedirectCheckoutVault = props => {
    const classes = useStyle(defaultClasses, props.classes);
    const { paymentCode } = props;
    const cardsExisting = [];
    const [activeIndex, setIndex] = useState(null);
    const {cards, loading, handleClickActive, onBillingAddressChangedError,
        onBillingAddressChangedSuccess} = useWorldLineRedirectCheckoutVault(props);

    if (cards && cards.length) {
        cards.forEach(function (card) {
            if (paymentCode.indexOf(card.payment_method_code) !== -1) {
                cardsExisting.push(card);
            }
        });
    }

    const handleClick = useCallback(async (token, index, publicHash) => {
        await setIndex(index);
        handleClickActive(token, index, publicHash);
    },[setIndex, handleClickActive])

    return (
        <div className={classes.root}>
            {!!cardsExisting.length && cardsExisting.map((item, index) => {
                const token = item.token;
                const publicHash = item.public_hash;
                const details = JSON.parse(item.details);
                const image = getCardImages(details.type);
                const methodCode = item.payment_method_code;

                return (
                    <Fragment key={index}>
                        <div key={index} className={`${classes.cars} ${activeIndex === index && classes.active}`} onClick={()=> handleClick(token, index, publicHash, methodCode )}>
                            <div className={classes.details}>
                                <span className={classes.type}>
                                    { image ? <img alt={details.type} src={image} width={40}/> : details.type}
                                </span>
                                <span className={classes.ending}>
                                    <FormattedMessage
                                        id="paymetMethod.ending"
                                        defaultMessage="ending"
                                    />
                                </span>
                                <span className={classes.maskedCC}>{details.maskedCC}</span>
                                <span className={classes.expires}>
                                    (
                                    <FormattedMessage
                                        id="paymetMethod.expires"
                                        defaultMessage="expires"
                                    />
                                    {' '}
                                    {details.expirationDate}
                                    )
                                </span>
                            </div>
                            <div className={classes.checkmark}>
                                { activeIndex === index &&
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" aria-labelledby="title"
                                          aria-describedby="desc" role="img">
                                        <circle data-name="layer2"
                                                cx="32" cy="32" r="30" transform="rotate(-45 32 32)" fill="none"
                                                stroke="#202020"
                                                stroke-miterlimit="10" stroke-width="2" stroke-linejoin="round"
                                                stroke-linecap="round"></circle>
                                        <path data-name="layer1" fill="none" stroke="#202020" stroke-miterlimit="10"
                                              stroke-width="2" d="M20.998 32.015l8.992 8.992 16.011-16.011"
                                              stroke-linejoin="round"
                                              stroke-linecap="round"></path>
                                    </svg>
                                }
                            </div>
                        </div>
                        { activeIndex === index &&
                          <BillingAddress
                                resetShouldSubmit={props.resetShouldSubmit}
                                shouldSubmit={props.shouldSubmit}
                                onBillingAddressChangedError={onBillingAddressChangedError}
                                onBillingAddressChangedSuccess={onBillingAddressChangedSuccess}
                            />
                        }
                    </Fragment>
                )
            })}
            {!cardsExisting.length &&
                <span className={classes.errorMessages}>
                    <FormattedMessage
                        id={'checkoutPage.noPaymentAvailable'}
                        defaultMessage={'Payment is currently unavailable.'}
                    />
                </span>
            }
        </div>
    )
};

export default WorldLineRedirectCheckoutVault;

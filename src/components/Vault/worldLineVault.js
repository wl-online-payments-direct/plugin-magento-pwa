import React, { Fragment, useCallback, useState } from 'react';
import { useStyle } from '@magento/venia-ui/lib/classify';
import { useWorldLineVault } from "@worldline/worldline-payment/src/talons/vault/useWorldLineVault";
import defaultClasses from './worldlineVault.module.css'
import { useWorldLineConfig } from "@worldline/worldline-payment/src/talons/useWorldLineConfig";
import BillingAddress from '@magento/venia-ui/lib/components/CheckoutPage/BillingAddress';
import { FormattedMessage } from "react-intl";
import { getCardImages } from "@worldline/worldline-payment/src/utils/constants";

const WorldLineVault = props => {
    const classes = useStyle(defaultClasses, props.classes);
    const [activeIndex, setIndex] = useState(null);
    const { config } = useWorldLineConfig();
    const {cards, loading, handleClickActive, onBillingAddressChangedError,
        onBillingAddressChangedSuccess} = useWorldLineVault(props);
    const cardsExsiting = cards && cards.filter(item => item.payment_method_code === 'worldline_cc') || [];
    const handleClick = useCallback(async (token, index, publicHash) => {
        await setIndex(index);
        handleClickActive(token, index, config, publicHash);
    },[setIndex, config, handleClickActive])

    return (
        <div className={classes.root}>
            {!!cardsExsiting.length && cardsExsiting.map((item, index) => {
                const token = item.token;
                const publicHash = item.public_hash;
                const details = JSON.parse(item.details);
                const image = getCardImages(details.type);

                return (
                    <Fragment key={index}>
                        <div key={index} className={`${classes.cars} ${activeIndex === index && classes.active}`} onClick={()=> handleClick(token, index, publicHash)}>
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
                            <>
                                <div id={`div-tokenization-${index}`} className={`${classes.form} ${activeIndex === index && classes.activeForm}`}></div>
                                <BillingAddress
                                    resetShouldSubmit={props.resetShouldSubmit}
                                    shouldSubmit={props.shouldSubmit}
                                    onBillingAddressChangedError={onBillingAddressChangedError}
                                    onBillingAddressChangedSuccess={onBillingAddressChangedSuccess}
                                />
                            </>
                        }
                    </Fragment>
                )
            })}
            {!cardsExsiting.length &&
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

export default WorldLineVault;

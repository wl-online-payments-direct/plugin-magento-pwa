import React, { useMemo, useEffect } from 'react';
import { shape, string } from 'prop-types';
import { FormattedMessage, useIntl } from 'react-intl';
import {
    AlertCircle as AlertCircleIcon,
    Trash2 as DeleteIcon
} from 'react-feather';

import { useToasts } from '@magento/peregrine';
import { useCreditCard } from '@magento/peregrine/lib/talons/SavedPaymentsPage/useCreditCard';

import { useStyle } from '@magento/venia-ui/lib/classify';
import Button from '@magento/venia-ui/lib/components/Button';
import Icon from '@magento/venia-ui/lib/components/Icon';
import LinkButton from '@magento/venia-ui/lib/components/LinkButton';
import defaultClasses from './creditCard.module.css';
import { getCardImages, cardTypeMapper } from "@worldline/worldline-payment/src/utils/constants";


const errorIcon = <Icon src={AlertCircleIcon} size={20} />;

const WorldlineHostedCheckout = props => {
    const { classes: propClasses, details, public_hash } = props;

    const talonProps = useCreditCard({ paymentHash: public_hash });
    const {
        handleDeletePayment,
        hasError,
        isConfirmingDelete,
        isDeletingPayment,
        toggleDeleteConfirmation
    } = talonProps;

    const { formatMessage } = useIntl();
    const [, { addToast }] = useToasts();

    useEffect(() => {
        if (hasError) {
            addToast({
                type: 'error',
                icon: errorIcon,
                message: formatMessage({
                    id: 'savedPaymentsPage.creditCard.errorRemoving',
                    defaultMessage:
                        'Something went wrong deleting this payment method. Please refresh and try again.'
                }),
                dismissable: true,
                timeout: 7000
            });
        }
    }, [addToast, formatMessage, hasError]);

    const classes = useStyle(defaultClasses, propClasses);

    const number = `**** ${details.maskedCC} \u00A0\u00A0`;
    const cardExpiryDate = useMemo(() => {
        const [month, year] = details.expirationDate.split('/');
        const shortMonth = new Date(+year, +month - 1).toLocaleString(
            'default',
            { month: 'short' }
        );

        return `${shortMonth}. ${year}`;
    }, [details.expirationDate]);

    const rootClass = isConfirmingDelete ? classes.root_active : classes.root;

    const deleteButton = (
        <LinkButton
            classes={{ root: classes.deleteButton }}
            disabled={isConfirmingDelete}
            onClick={toggleDeleteConfirmation}
        >
            <Icon classes={{ icon: undefined }} size={16} src={DeleteIcon} />
            <span className={classes.deleteText}>
                <FormattedMessage
                    id={'storedPayments.delete'}
                    defaultMessage={'Delete'}
                />
            </span>
        </LinkButton>
    );

    const deleteConfirmationOverlayClass = isConfirmingDelete
        ? classes.deleteConfirmationContainer
        : classes.deleteConfirmationContainer_hidden;

    const deleteConfirmationOverlay = (
        <div className={deleteConfirmationOverlayClass}>
            <Button
                classes={{
                    root_normalPriorityNegative: classes.confirmDeleteButton
                }}
                disabled={isDeletingPayment}
                onClick={handleDeletePayment}
                negative={true}
                priority="normal"
                type="button"
            >
                <FormattedMessage
                    id={'global.deleteButton'}
                    defaultMessage={'Delete'}
                />
            </Button>
            <Button
                classes={{ root_lowPriority: classes.cancelDeleteButton }}
                disabled={isDeletingPayment}
                onClick={toggleDeleteConfirmation}
                priority="low"
                type="button"
            >
                <FormattedMessage
                    id={'global.cancelButton'}
                    defaultMessage={'Cancel'}
                />
            </Button>
        </div>
    );
    return (
        <div className={rootClass}>
            <div className={classes.title}>
                <FormattedMessage
                    id={'storedPayments.worldlineHostedCheckout'}
                    defaultMessage={'Worldline Hosted Checkout'}
                />
            </div>
            <div className={classes.number}>
                {number}
                {getCardImages(details.type) && <img style={{display: "inline-block"}} alt={details.type} src={getCardImages(details.type)} width={40}/> || cardTypeMapper[
                    details.type
                    ] || ''}
            </div>           <div className={classes.expiry_date}>{cardExpiryDate}</div>
            <div className={classes.delete}>{deleteButton}</div>
            {deleteConfirmationOverlay}
        </div>
    );
};
export default WorldlineHostedCheckout;
WorldlineHostedCheckout.propTypes = {
    classes: shape({
        delete: 'string',
        deleteButton: 'string',
        deleteConfirmationContainer: 'string',
        deleteConfirmationContainer_hidden: 'string',
        expiry_date: 'string',
        number: 'string',
        root_selected: 'string',
        root: 'string',
        title: 'string'
    }),
    details: shape({
        expirationDate: string,
        maskedCC: string,
        type: string
    })
};


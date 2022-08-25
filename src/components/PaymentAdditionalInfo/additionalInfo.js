import { useStyle } from '@magento/venia-ui/lib/classify';
import defaultClasses from './additionalInfo.module.css';
import React from 'react';

const PaymentAdditionalInfo = props => {
    const { data, classes: propsClasses } = props;
    const classes = useStyle(defaultClasses, propsClasses);
    const [{ additional_data }] = data;

    if (!additional_data) {
        return null;
    }

    const totals = additional_data.find(obj => obj.name === 'Total');
    const icon = additional_data.find(obj => obj.name === 'Url');

    return (
        <div className={classes.root}>
            {icon && icon.value && <img className={classes.icon} src={icon.value} alt={icon.name}/>}
            {totals && totals.value && (
                <div className={classes.totals}>
                    <span>{totals.name}</span>
                    <span>{totals.value}</span>
                </div>
            )}
        </div>
    );
};

export default PaymentAdditionalInfo;

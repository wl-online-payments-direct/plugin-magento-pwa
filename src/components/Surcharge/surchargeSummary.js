import React, {Fragment} from "react";
import { useIntl } from 'react-intl';
import Price from '@magento/venia-ui/lib/components/Price';
import { useStyle } from '@magento/venia-ui/lib/classify';

const SurchargeSummary = props => {
    const classes = useStyle({}, props.classes);
    const { data } = props;
    const { formatMessage } = useIntl();

    if (!data || !data.amount) {
        return null;
    }

    const shippingLabel = formatMessage({
          id: 'surchargeSummary.surcharge',
          defaultMessage: 'Surcharge'
      });

    const price = <Price value={data.amount} currencyCode={data.currency_code} />

    return (
        <>{ price &&
            <Fragment>
                <span className={classes.lineItemLabel}>{shippingLabel}</span>
                <span
                    data-cy="SurchargeSummary-shippingValue"
                    className={classes.price}
                >
                    {price}
                </span>
            </Fragment>
        }</>
    );
};

export default SurchargeSummary;

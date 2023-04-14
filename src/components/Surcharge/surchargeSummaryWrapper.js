import React from "react";
import SurchargeSummary from './surchargeSummary';
import defaultClasses from './surchargeSummaryWrapper.module.css';
import { useStyle } from '@magento/venia-ui/lib/classify';

const SurchargeSummaryWrapper = props => {
    const { classes: propClasses, surcharge } = props;
    const classes = useStyle(defaultClasses, propClasses);

    if (!surcharge) {
        return null;
    }

    return (
        <div className={classes.root}>
            <SurchargeSummary data={surcharge} classes={classes} />
        </div>
    );
};

export default SurchargeSummaryWrapper;

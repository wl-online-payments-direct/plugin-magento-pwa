import React from 'react';
import { useStyle } from '@magento/venia-ui/lib/classify';
import {bool, shape, string} from 'prop-types';
import defaultClasses from './iconsList.module.css'
import { useCartInfo } from "../../talons/useCartInfo";

const IconsList = props => {
    const classes = useStyle(defaultClasses, props.classes);
    const useAdditionalClasses = props.use_additional_classes || null;
    const { cartInfo: iconsList } = useCartInfo({ attribute: 'icons', ...props });

    let rootClassList = classes.root;

    if (useAdditionalClasses) {
        rootClassList += ' ' + classes.additional;
    }

    const html = iconsList && iconsList.map((item, index) => {
        return (
            <li key={index} title={item.icon_title}>
                <img className={classes.image} src={item.icon_url} alt={item.icon_title} />
            </li>
        );
    });

    return (
        <ul className={rootClassList}>
            {html}
        </ul>
    );
};

IconsList.propTypes = {
    classes: shape({
        root: string,
        image: string
    }),
    code: string.isRequired,
    use_additional_classes: bool
};

export default IconsList;

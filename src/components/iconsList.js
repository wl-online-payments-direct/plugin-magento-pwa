import React from 'react';
import { useStyle } from '@magento/venia-ui/lib/classify';
import { shape, string } from 'prop-types';
import defaultClasses from './iconsList.module.css'
import {useIconsList} from "../talons/useIconsList";

const IconsList = props => {
    const classes = useStyle(defaultClasses, props.classes);
    const { iconsList } = useIconsList(props);

    const iconsHtml = iconsList && iconsList.map((item, index) => {
        return (
            <li key={index} title={item.icon_title}>
                <img className={classes.image} src={item.icon_url} alt={item.icon_title} />
            </li>
        );
    });

    return (
        <ul className={classes.root}>
            {iconsHtml}
        </ul>
    );
};

IconsList.propTypes = {
    classes: shape({
        root: string,
        image: string
    }),
    code: string.isRequired
};

export default IconsList;

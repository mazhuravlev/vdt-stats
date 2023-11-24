import {
    useNavigate,
    To
} from "react-router-dom";
import React, { useEffect } from 'react';

export const Redirect: React.FC<{ to: To; }> = (props) => {
    const navigate = useNavigate();
    useEffect(() => {
        navigate(props.to);
    }, []);
    return null;
};

import React from 'react'
import {Redirect} from 'react-router-dom'

const PageNotFound = (location) => {
    const {pathname} = location.location;
    if (pathname.substr(-1) === '/') {
        return <Redirect to={pathname.substr(0, pathname.length - 1)} />;
    } else {
        return <div className="text-center"><h3 style={{color:'#FFF'}}>Page not found</h3><h2 style={{color:'#FFF'}}>404</h2></div>;
    }
};

export default PageNotFound


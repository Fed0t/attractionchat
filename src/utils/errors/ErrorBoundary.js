import React, {Component} from 'react';
import SomeErrorReportingTool from './SomeErrorReportingTool';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            info: '',
            error: '',
        };
    }

    componentDidCatch(error, info) {
        this.setState({hasError: true, info, error});

        if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
            console.log(`Error: ${error}`);
            console.log(`ErrorInfo: ${JSON.stringify(info)}`);
        }
        else {
            SomeErrorReportingTool.report(error, info);
        }
    }

    resetState() {
        this.props.persistor.purge();
        window.location.reload();
        localStorage.clear();
    }

    render() {
        return this.state.hasError ?
            <p>Something bad happened :(. (Please don't use two accounts - please read our terms and conditions) <a style={{color: 'red'}} onClick={() => {
                this.resetState();
            }}> Click to Refresh </a></p> : this.props.children;
    }
}

export default ErrorBoundary;
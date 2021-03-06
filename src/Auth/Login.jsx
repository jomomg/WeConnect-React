import React, { Component } from 'react';
import './Forms.css';
import { Link, Redirect } from 'react-router-dom';
import request from 'superagent';
import validateInput from './validations/Login.js';
import Auth from './Auth.js';
import { BASE_URL } from '../utils/url.js';

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      errors: {},
      isLoading: false,
      fireRedirect: false
    };
    
    this.handleSubmit = this.handleSubmit.bind(this);
    this.logChange = this.logChange.bind(this);
  }
  
  isValid() {
    const { errors, isValid } = validateInput(this.state);

    if (!isValid) {
      this.setState({ errors });
    }

    return isValid;
  }
  
  handleSubmit(e) {
    e.preventDefault();
    if (this.isValid()) {
      this.setState({ errors: {}, isLoading: true });
    
      var data = {
        username: this.state.username,
        password: this.state.password
      };

      var url = `${BASE_URL}/api/v2/auth/login`;
  
      request
        .post(url)
        .set('Content-Type', 'application/json')
        .send({ username: data.username, password: data.password })
        .end((err, res) => {
          if(res.status === 200) {
            Auth.authenticate();
            window.localStorage.setItem('token', res.body.token);
            this.setState({ fireRedirect: true });
          }
          else {
            this.setState({ errors: err.response.body, isLoading: false });
          }
        });
    }
  }

  logChange(e) {
    this.setState({
      [e.target.name]: e.target.value
    });
  }

  render() {
    const { from } = this.props.location.state || '/';
    const fireRedirect = this.state.fireRedirect;
    return(
      <div className="container push">
        <div className="registration login">
          <form onSubmit={this.handleSubmit}>
            <h1>Login</h1>
            
            { this.state.errors.warning && <div className="alert alert-danger">{this.state.errors.warning}</div> }

            <input type="text"
            name="username"
            placeholder="Username"
            className="input pass"
            value={this.state.username}
            onChange={this.logChange}
            />
            {this.state.errors.username && <div className="invalid-feedback">{this.state.errors.username}</div>}

            <input name="password"
            type="password"
            placeholder="Password"
            error={this.state.errors.password}
            className="input pass"
            value={this.state.password}
            onChange={this.logChange}
            />
            {this.state.errors.password && <div className="invalid-feedback">{this.state.errors.password}</div>}

            <button type="submit" className="submit-btn" disabled={this.state.isLoading}>
              login&nbsp;
              { this.state.isLoading && <i className="fa fa-spinner fa-spin" /> }
            </button>
          </form>
          { fireRedirect && (<Redirect to={from || '/'}/>) }
          <div className="text-center">
            Don't have an account? <Link to="/auth/signup">Sign Up</Link><br />
            <Link to="/">Forgot password</Link>
          </div>
        </div>
      </div>
    );
  }
}

export default Login;
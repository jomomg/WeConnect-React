import React, { Component } from 'react';
import './Forms.css';
import { Link, Redirect } from 'react-router-dom';
import request from 'superagent';
import validateInput from './validations/Login.js';
import Auth from './Auth.js';
import { BASE_URL } from '../../helpers/url.js';
import { notify } from '../../helpers/notify.js';
import InputAuth from '../../common/ElementComponents/InputAuth';
import ButtonAuth from '../../common/ElementComponents/ButtonAuth';

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

      const { username, password} = this.state;

      let url = `${BASE_URL}/api/v2/auth/login`;

      request
        .post(url)
        .set('Content-Type', 'application/json')
        .send({ username: username, password: password })
        .then(res => {
          if(res.status === 200) {
            Auth.authenticate();
            sessionStorage.setItem('token', res.body.token);
            this.setState({ fireRedirect: true });
            notify('success', res.body.success);
          }
          else {
            this.setState({ errors: res.response.body, isLoading: false });
            notify('success', res.body);
          }
        })
        .catch(err => {
          this.setState({ errors: err.response.body, isLoading: false });
          notify('warning', err.response.body.warning);
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

            <InputAuth name="username" placeholder="Username" type="text" value={this.state.username} error={this.state.errors.username} onChange={this.logChange} />

            <InputAuth name="password" placeholder="password" type="password" value={this.state.password} error={this.state.errors.password} onChange={this.logChange} />

            <ButtonAuth disabled={this.state.isLoading} label="login" />
          </form>
          { fireRedirect && (<Redirect to={from || '/'}/>) }
          <div className="text-center">
            Don't have an account? <Link to="/auth/signup">Sign Up</Link><br />
            <Link to="/auth/forgot-password">Forgot password</Link>
          </div>
        </div>
      </div>
    );
  }
}

export default Login;

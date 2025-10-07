import React, { Component } from 'react'

export default class Footer extends Component {
  render() {
    return (
      <footer className="content-footer footer bg-footer-theme">
        <div className="container-xxl d-flex flex-wrap justify-content-between py-2 flex-md-row flex-column">
          <div className="mb-2 mb-md-0">
            © {new Date().getFullYear()}
            | Developed by
            <a href="https://deovaze.com" target="_blank" className="footer-link fw-bolder">Deovaze</a>
          </div>
        </div>
      </footer>
    )
  }
}

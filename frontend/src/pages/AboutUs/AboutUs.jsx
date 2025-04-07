import React from 'react';
import './AboutUs.css'; 

const AboutUs = () => {
  return (
    <div className="container">
      <h3>Why Choose Us?</h3>
      <p>
        <span className="highlight">Freshness Guaranteed:</span> All our meat is freshly cut and delivered to you, with no frozen products ever.
      </p>
      <p><span className="highlight">Timely Delivery:</span> Get your order delivered in under 45 minutes – because we value your time.</p>
      <p><span className="highlight">Affordable Pricing:</span> Enjoy competitive prices that offer you the best value for your money.</p>
      <p><span className="highlight">Local Vendors:</span> Supporting local businesses while delivering only the finest products.</p>
      <p>
        At the heart of our company, we value integrity, excellence, and
        customer satisfaction. We strive to build long-lasting relationships
        with our clients and work together to create lasting impact.
      </p>
      <p>
        Our team of experts brings a wealth of experience and knowledge to
        the table, ensuring that we can tackle any challenge that comes our
        way. We are constantly learning and adapting to the ever-changing
        landscape, always seeking new ways to improve and deliver exceptional
        results.
      </p>
    </div>
  );
};

export default AboutUs;

const sgMail = require("@sendgrid/mail");

exports.sendMail = async (to, subject, text) => {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  const msg = {
    to: to,
    from: "charbel_makhlouf76@live.com",
    subject: subject,
    text: text,
  };
  sgMail
    .send(msg)
    .then((response) => {
      console.log(response[0].statusCode);
      console.log(response[0].headers);
    })
    .catch((error) => {
      console.error(error);
    });
};

exports.sendMailInvoice = async (to, name, cartItems, totalPrice) => {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  const msg = {
    to: to,
    from: "charbel_makhlouf76@live.com",
    subject: "Order Invoice",
    text: `Hello ${name}, Your order has been completed.`,
    html: `<div style="font-weight:600;color:#3b5998"><span>Hello ${name}, Your order has been completed.</span></div><div style="padding:1rem 0;margin:1rem 0 ;border-top:1px solid #e5e5e5;border-bottom:1px solid #e5e5e5;font-size:17px"><div><span>Your items and the total price.</span></div><div style="padding:1rem 0 ;margin:0"><span style="color:#898f9c">${cartItems}</span><br /><br /><span style="color:#898f9c">Total Price: ${totalPrice}</span></div></div>`,
  };
  sgMail
    .send(msg)
    .then((response) => {
      console.log(response[0].statusCode);
      console.log(response[0].headers);
    })
    .catch((error) => {
      console.error(error);
    });
};

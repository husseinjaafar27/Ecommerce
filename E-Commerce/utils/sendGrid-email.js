const sgMail = require("@sendgrid/mail");

exports.sendMail = async (to,subject,text) => {
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

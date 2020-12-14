module.exports =
    '<body style="padding: 0;margin: 0;font-family: Arial, Helvetica, sans-serif;">\
        <div style="margin-top: 8%;text-align: center;">\
            <ul style="list-style: none;">\
                <li style="color:#827f9e;font-size: 20px;">Welcome, {{ name }},</li>\
                <li>Thank you for register . Your One Time Password is given below.</b></li>\
                <li style="margin-top:10px; font-size: 150%;">{{ verification_code }}</li>\
            </ul>\
        </div>\
        <div style = "width: 100%; margin: 0 auto;">\
            <span style = "background-image: url({{ site_url }}uploads/email_template/button.png); height: 83px; display: flex; background-repeat: no-repeat; width: 100%; background-position: center;" >\
                <a style = "text-decoration: none; color:white; font-weight: 600;margin: 0 auto;margin-top: 30px;font-size: 17px;" > Start a new order </a>\
            </span>\
        </div>\
</body>';
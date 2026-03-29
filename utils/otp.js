function generateOtp(length = 6) {
  const digits = '0123456789';
  let otp = '';

  for (let index = 0; index < length; index += 1) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }

  return otp;
}

function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

module.exports = { generateOtp, addMinutes };


import axios from "axios";
import qs from "qs";
import crypto from "crypto";

function normalizeNumber(raw) {
  let number = raw.replace(/\D/g, "");
  if (number.startsWith("09")) return "+63" + number.slice(1);
  if (number.startsWith("9") && number.length === 10) return "+63" + number;
  if (number.startsWith("63") && number.length === 12) return "+" + number;
  if (number.startsWith("+63") && number.length === 13) return number;
  return null;
}

function generateDeviceId() {
  return crypto.randomBytes(8).toString("hex");
}

export default async function handler(req, res) {
  try {
    const { n: inputNumber, t: inputText } = req.query;

    if (!inputNumber || !inputText) {
      return res.status(400).json({ success: false, error: "Missing params (n=number & t=text)" });
    }

    const normalized = normalizeNumber(inputNumber);
    if (!normalized) {
      return res.status(400).json({ success: false, error: "Invalid number format" });
    }

    const suffix = "-freed0m";
    const credits = "\n\nThis is a free text, official PH content crafted by Jaymar.";
    const withSuffix = inputText.endsWith(suffix) ? inputText : `${inputText} ${suffix}`;
    const finalText = `${withSuffix}${credits}`;

    const payload = [
      "free.text.sms",
      "412",
      normalized,
      "DEVICE",
      "fjsx9-G7QvGjmPgI08MMH0:APA91bGcxiqo05qhojnIdWFYpJMHAr45V8-kdccEshHpsci6UVaxPH4X4I57Mr6taR6T4wfsuKFJ_T-PBcbiWKsKXstfMyd6cwdqwmvaoo7bSsSJeKhnpiM",
      finalText,
      ""
    ];

    const postData = qs.stringify({
      humottaee: "Processing",
      "$Oj0O%K7zi2j18E": JSON.stringify(payload),
      device_id: generateDeviceId()
    });

    const response = await axios.post("https://sms.m2techtronix.com/v13/sms.php", postData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    });

    return res.status(200).json({
      success: true,
      data: {
        message: response.data.message,
        author: "Jay Mar"
      }
    });

  } catch (err) {
    console.error("SMS Error:", err.response?.data || err.message);
    return res.status(500).json({
      success: false,
      message: "Failed to send sms",
      error: err.response?.data || err.message
    });
  }
}

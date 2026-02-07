import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { name, email, message } = await req.json()
    const client = new SmtpClient()

    // Pure Google SMTP logic using your App Password
    await client.connectTLS({
      hostname: "smtp.gmail.com",
      port: 465,
      username: "neelsabhaya90@gmail.com",
      password: "wdalmzmvbbhxupfm", 
    })

    await client.send({
      from: "neelsabhaya90@gmail.com",
      to: "neelsabhaya90@gmail.com", 
      subject: `Lumina Inquiry: ${name}`,
      content: `Email: ${email}\n\nMessage: ${message}`,
    })

    await client.close()
    return new Response(JSON.stringify({ sent: true }), { 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders })
  }
})
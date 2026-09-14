// The built-in "Network Security — Week 5" sample notes.
// Used whenever a user picks "Use Sample Notes" instead of pasting/uploading their own.

const SAMPLE_NOTES_TEXT = `Network Security — Week 5

Firewalls sit at the boundary of a network and filter traffic using rules based on IP address, port, and protocol. Stateful firewalls track the state of active connections so return traffic is automatically permitted.

Intrusion Detection Systems (IDS) passively monitor traffic and raise alerts when they spot suspicious activity, using either signature-based or anomaly-based detection. They do not block traffic themselves.

Intrusion Prevention Systems (IPS) sit inline with traffic and can automatically block or drop malicious packets in real time, using similar detection techniques to an IDS but reacting immediately.

A Virtual Private Network (VPN) encrypts traffic and creates a secure tunnel across a public network such as the internet, allowing remote users to access a private network as if they were local.

IPsec is a protocol suite that adds authentication (via AH) and encryption (via ESP) at the network layer, operating in either transport mode or tunnel mode, and is commonly used to build site-to-site VPNs.`;

module.exports = { SAMPLE_NOTES_TEXT };

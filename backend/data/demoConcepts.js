// Hand-written, high-quality demo content for each concept in the built-in
// "Network Security — Week 5" sample notes. This is what makes Demo Mode
// feel polished instead of just generic sentence extraction.

const CONCEPT_ORDER = ['firewall', 'ids', 'ips', 'vpn', 'ipsec'];

const CONCEPTS = {
  firewall: {
    id: 'firewall',
    name: 'Firewalls',
    icon: '🧱',
    simple:
      'A firewall is a checkpoint between your network and the outside world. It looks at each piece of traffic and only lets through what matches its rules — like a guard checking IDs at a door.',
    detailed:
      'A firewall enforces a security policy at the boundary of a network by inspecting packets against a rule set (source/destination IP, port, protocol) and allowing or dropping them accordingly. Modern firewalls also track connection state (stateful inspection) so replies to allowed outbound traffic are automatically permitted.',
    analogy:
      'Think of a nightclub bouncer with a guest list. Anyone not on the list — or trying to sneak in through a side door (an unexpected port) — gets turned away, no matter how politely they ask.',
    keyPoints: [
      'Sits at the network boundary and filters traffic',
      'Rules are based on IP address, port, and protocol',
      'Stateful firewalls track ongoing connections',
      'Blocks by default, allows by exception',
    ],
    keywords: ['filter', 'traffic', 'rules', 'block', 'allow', 'boundary', 'packet', 'port', 'stateful'],
    mcqs: [
      {
        q: 'What is the primary job of a firewall?',
        options: ['Encrypt all outgoing traffic', 'Filter traffic based on a rule set', 'Detect malware signatures in files', 'Speed up network connections'],
        answer: 1,
      },
      {
        q: 'What does a "stateful" firewall track?',
        options: ['CPU temperature', 'The color of packets', 'The state of ongoing connections', 'Wi-Fi signal strength'],
        answer: 2,
      },
    ],
    flashcards: [
      { front: 'What does a firewall do?', back: 'Filters network traffic against a rule set, blocking anything not explicitly allowed.' },
      { front: 'Stateful vs stateless firewall', back: 'Stateful tracks active connections; stateless checks every packet in isolation.' },
    ],
  },
  ids: {
    id: 'ids',
    name: 'Intrusion Detection (IDS)',
    icon: '🔍',
    simple:
      "An IDS watches network traffic and raises an alarm when it spots something suspicious — but it doesn't stop the traffic itself, just flags it.",
    detailed:
      'An Intrusion Detection System passively monitors network or host activity, comparing it against known attack signatures or unusual behaviour patterns, and generates alerts for a security team to investigate. It operates out-of-band and does not modify traffic in transit.',
    analogy:
      "It's a smoke detector, not a sprinkler system — it notices the fire and sounds the alarm, but someone else has to come put it out.",
    keyPoints: [
      'Monitors traffic passively',
      'Generates alerts, does not block',
      'Signature-based or anomaly-based detection',
      'Requires a human or system to act on alerts',
    ],
    keywords: ['monitor', 'alert', 'detect', 'signature', 'anomaly', 'passive', 'suspicious'],
    mcqs: [
      {
        q: 'What does an IDS do when it finds suspicious activity?',
        options: ['Automatically deletes the file', 'Raises an alert', 'Shuts down the network', 'Encrypts the traffic'],
        answer: 1,
      },
      {
        q: 'IDS detection can be based on…',
        options: ['Screen resolution', 'Known signatures or anomalies', 'Battery level', 'Keyboard layout'],
        answer: 1,
      },
    ],
    flashcards: [
      { front: 'What is an IDS?', back: 'A system that monitors traffic and alerts on suspicious activity, without blocking it.' },
      { front: 'Signature-based vs anomaly-based detection', back: 'Signature-based matches known attack patterns; anomaly-based flags deviations from normal behaviour.' },
    ],
  },
  ips: {
    id: 'ips',
    name: 'Intrusion Prevention (IPS)',
    icon: '🛡️',
    simple:
      'An IPS is like an IDS with the power to act — it sits inline with traffic and can automatically block anything it flags as malicious.',
    detailed:
      'An Intrusion Prevention System sits inline with network traffic (rather than passively observing) and can automatically drop packets, reset connections, or block source addresses in real time when it detects malicious activity, based on the same signature and anomaly techniques as an IDS.',
    analogy:
      'If an IDS is a smoke detector, an IPS is that detector wired directly to the sprinklers — it reacts on its own, instantly.',
    keyPoints: [
      'Sits inline with live traffic',
      'Can automatically block or drop malicious traffic',
      'Uses the same detection techniques as IDS',
      'Faster response, but risk of false-positive blocks',
    ],
    keywords: ['inline', 'block', 'prevent', 'automatic', 'drop', 'reset', 'real time'],
    mcqs: [
      {
        q: 'What makes an IPS different from an IDS?',
        options: ['IPS only works on Wi-Fi', 'IPS can automatically block traffic', 'IPS is slower', 'IPS requires no rules'],
        answer: 1,
      },
      {
        q: 'A risk of an IPS acting automatically is…',
        options: ['It never generates logs', 'False positives blocking legitimate traffic', 'It cannot detect malware', 'It only runs once a day'],
        answer: 1,
      },
    ],
    flashcards: [
      { front: 'What is an IPS?', back: 'An inline system that detects and automatically blocks malicious traffic in real time.' },
      { front: 'Key trade-off of an IPS', back: 'Faster automatic response, but false positives can block legitimate traffic.' },
    ],
  },
  vpn: {
    id: 'vpn',
    name: 'VPN',
    icon: '🔒',
    simple:
      "A VPN creates a private, encrypted tunnel for your traffic across a public network, so what you send can't be read by anyone in between.",
    detailed:
      'A Virtual Private Network encapsulates and encrypts traffic between an endpoint and a VPN gateway, creating a secure tunnel across an untrusted network such as the public internet. This protects confidentiality and can also let remote users appear as if they are on a private internal network.',
    analogy:
      'Imagine mailing a letter inside a locked, opaque box instead of a see-through envelope — anyone who intercepts it in transit just sees a sealed box, not the contents.',
    keyPoints: [
      'Encrypts traffic between endpoints',
      'Creates a secure "tunnel" over a public network',
      'Lets remote users access a private network as if local',
      'Protects confidentiality, not just anonymity',
    ],
    keywords: ['encrypt', 'tunnel', 'private', 'remote', 'secure', 'public network'],
    mcqs: [
      {
        q: 'What does a VPN primarily provide?',
        options: ['Faster internet speeds', 'An encrypted tunnel over a public network', 'Free public Wi-Fi', 'Virus removal'],
        answer: 1,
      },
      {
        q: 'A VPN lets a remote user…',
        options: ['Access the internal network as if local', 'Bypass all firewalls automatically', 'Skip authentication', 'Disable encryption for speed'],
        answer: 0,
      },
    ],
    flashcards: [
      { front: 'What does VPN stand for and do?', back: 'Virtual Private Network — encrypts traffic through a secure tunnel over a public network.' },
      { front: 'Why use a VPN for remote work?', back: 'It lets remote users securely reach internal resources as if they were on the local network.' },
    ],
  },
  ipsec: {
    id: 'ipsec',
    name: 'IPsec',
    icon: '🔗',
    simple:
      'IPsec is a set of rules that adds authentication and encryption directly at the network layer, so IP traffic itself is protected — often used to build VPNs.',
    detailed:
      'IPsec (Internet Protocol Security) is a protocol suite operating at the network layer that provides authentication (via AH) and confidentiality (via ESP) for IP packets. It supports two modes — transport mode (encrypts the payload) and tunnel mode (encrypts the entire packet) — and is a common foundation for site-to-site VPNs.',
    analogy:
      'If a VPN is the "locked box" idea, IPsec is one of the actual lock-and-key mechanisms used to build that box — a standard toolkit rather than a single product.',
    keyPoints: [
      'Works at the network (IP) layer',
      'AH provides authentication, ESP provides encryption',
      'Transport mode vs tunnel mode',
      'Common foundation for site-to-site VPNs',
    ],
    keywords: ['authentication', 'encryption', 'network layer', 'tunnel mode', 'transport mode', 'ah', 'esp'],
    mcqs: [
      {
        q: 'What does ESP provide in IPsec?',
        options: ['Encryption/confidentiality', 'Faster routing', 'DNS resolution', 'Physical security'],
        answer: 0,
      },
      {
        q: 'Tunnel mode in IPsec encrypts…',
        options: ['Nothing', 'Only the header', 'The entire original packet', 'Only DNS requests'],
        answer: 2,
      },
    ],
    flashcards: [
      { front: 'What layer does IPsec operate at?', back: 'The network (IP) layer.' },
      { front: 'AH vs ESP in IPsec', back: 'AH provides authentication; ESP provides encryption (confidentiality).' },
    ],
  },
};

module.exports = { CONCEPTS, CONCEPT_ORDER };

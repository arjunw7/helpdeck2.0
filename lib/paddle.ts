export type PaddlePrice = {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  priceIds: {
    sandbox: {
      monthly: string;
      yearly: string;
    };
    production: {
      monthly: string;
      yearly: string;
    };
  };
  features: string[];
  users: number | "Unlimited";
  articleLimit: number | "Unlimited";
};

export const PLANS: PaddlePrice[] = [
  {
    id: "starter",
    name: "Starter",
    description: "Perfect for small teams getting started",
    monthlyPrice: 29,
    yearlyPrice: 249,
    priceIds: {
      sandbox: {
        monthly: "pri_01jcdq1wggmrz3gsd3nqgq6dd8",
        yearly: "pri_01jcdq2pxpmtry18c2wjfsy0jj",
      },
      production: {
        monthly: "pri_01jcdq1wggmrz3gsd3nqgq6dd8",
        yearly: "pri_01jcdb9568ht9h60n2keetp7qh",
      },
    },
    features: [
      "Up to 4 team members",
      "100 articles limit",
      "Custom domain",
      "Email support",
      "AI-powered content generation",
      "Smart content suggestions",
      "Advanced semantic search",
    ],
    users: 4,
    articleLimit: 100,
  },
  {
    id: "pro",
    name: "Pro",
    description: "For growing teams that need more",
    monthlyPrice: 49,
    yearlyPrice: 399,
    priceIds: {
      sandbox: {
        monthly: "pri_01jcdqe0yjysaxcff0m7xjmjjj",
        yearly: "pri_01jcdqepga0wzyrw77jp0ctbzz",
      },
      production: {
        monthly: "pri_01jcdbeppfanqaq5cc35etb0bp",
        yearly: "pri_01jcdbg444vga5pzm022nnj172",
      },
    },
    features: [
      "Up to 8 team members",
      "500 articles limit",
      "Change Logs",
      "Custom domain",
      "Priority support",
      "Custom branding",
      "AI-powered content generation",
      "Smart content suggestions",
      "Advanced semantic search",
    ],
    users: 8,
    articleLimit: 500,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "For large organizations with custom needs",
    monthlyPrice: 99,
    yearlyPrice: 799,
    priceIds: {
      sandbox: {
        monthly: "pri_01jcdqhqphmg1c66jjhxhrwm5k",
        yearly: "pri_01jcdqjb5gw6zpw8pdmc5mncbg",
      },
      production: {
        monthly: "pri_01jcdbm2kf38de6ckp5rjqkpfq",
        yearly: "pri_01jcdbn6079xqhqqarw9s3s83b",
      },
    },
    features: [
      "Unlimited team members",
      "Unlimited articles",
      "Change Logs",
      "Custom domain",
      "24/7 priority support",
      "Custom branding",
      "AI-powered content generation",
      "Smart content suggestions",
      "Advanced semantic search",
    ],
    users: "Unlimited",
    articleLimit: "Unlimited",
  },
];
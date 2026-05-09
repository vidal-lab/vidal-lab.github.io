/* Research highlights data — derived from the live vidal-lab.github.io site */
window.HIGHLIGHTS = [
  {
    venue: "NeurIPS 2025",
    title: "Conformal Information Pursuit",
    sub: "Interactively Guiding Large Language Models",
    authors: ["Kwan Ho Ryan Chan","Yuyan Ge","Edgar Dobriban","Hamed Hassani","René Vidal"],
    desc: "We extend the information pursuit framework to large language models with conformal calibration, enabling LLMs to ask informative, targeted questions to disambiguate user intent — under formal uncertainty guarantees.",
    project: "https://ryanchankh.github.io/ConformalInformationPursuit/",
    paper: "https://arxiv.org/abs/2507.03279",
    palette: ["#990000","#011F5B"],
    motif: "lattice"
  },
  {
    venue: "ICCV 2025",
    title: "Voyaging into Perpetual Dynamic Scenes",
    sub: "from a Single View",
    authors: ["Fengrui Tian","Tianjiao Ding","Jinqi Luo","Hancheng Min","René Vidal"],
    desc: "Generates long, perpetually-unfolding dynamic 3D scenes from a single image by combining diffusion-based novel-view synthesis with temporal consistency constraints.",
    paper: "https://arxiv.org/abs/2507.04183",
    palette: ["#011F5B","#990000"],
    motif: "wave"
  },
  {
    venue: "NeurIPS 2025",
    title: "SECA",
    sub: "Eliciting LLM Hallucinations with Semantically Equivalent Attacks",
    authors: ["Buyun Liang","Liangzu Peng","Jinqi Luo","Darshan Thaker","Kwan Ho Ryan Chan","René Vidal"],
    desc: "A constrained optimization framework that finds semantically equivalent and coherent prompt rewrites that reliably trigger hallucinations in modern large language models.",
    paper: "https://arxiv.org/abs/2510.04398",
    palette: ["#990000","#C8102E"],
    motif: "noise"
  },
  {
    venue: "MICCAI 2025",
    title: "IP-CRR",
    sub: "Information Pursuit for Interpretable Chest Radiology",
    authors: ["Yuyan Ge","Kwan Ho Ryan Chan","Pablo Messina","René Vidal"],
    desc: "An interpretable-by-design system that classifies chest radiology reports by sequentially querying the most informative clinical concepts.",
    paper: "https://arxiv.org/abs/2505.00191",
    palette: ["#011F5B","#5C7AB8"],
    motif: "lattice"
  },
  {
    venue: "CVPR 2025",
    title: "Disentangling Safe & Unsafe Corruptions",
    sub: "via Anisotropy and Locality",
    authors: ["Ramchandran Muthukumar","Ambar Pal","Jeremias Sulam","René Vidal"],
    desc: "A new threat model that distinguishes safe from unsafe image corruptions through anisotropic, locality-aware geometric analysis of perturbations.",
    paper: "https://arxiv.org/abs/2501.18098",
    palette: ["#990000","#011F5B"],
    motif: "wave"
  },
  {
    venue: "IEEE TBME 2025",
    title: "CAMI-2DNet",
    sub: "Computerized Assessment of Motor Imitation for Autism",
    authors: ["Kaleab A. Kinfu","Carolina Pacheco","et al.","René Vidal"],
    desc: "A 2D video-based deep network that quantifies motor imitation ability as a behavioral biomarker for autism spectrum disorder.",
    paper: "https://arxiv.org/abs/2501.08609",
    palette: ["#011F5B","#990000"],
    motif: "noise"
  },
  {
    venue: "Preprint 2026",
    title: "Hierarchical Concept Embedding & Pursuit",
    sub: "for Interpretable Image Classification",
    authors: ["Nghia Nguyen","Tianjiao Ding","René Vidal"],
    desc: "A hierarchical concept-based classifier that explains predictions through a tree of human-understandable visual attributes.",
    paper: "https://arxiv.org/abs/2602.11448",
    palette: ["#5C7AB8","#0A3380"],
    motif: "lattice"
  },
  {
    venue: "CVPR 2025",
    title: "Concept Lancet",
    sub: "Image Editing with Compositional Representation Transplant",
    authors: ["Jinqi Luo","Tianjiao Ding","Kwan Ho Ryan Chan","Hancheng Min","Chris Callison-Burch","René Vidal"],
    desc: "A geometry-aware image editing framework that decomposes prompts into latent concept directions and transplants them with compositional control over the edit.",
    project: "https://peterljq.github.io/project/colan/",
    paper: "https://arxiv.org/abs/2504.02828",
    palette: ["#990000","#011F5B"],
    motif: "wave"
  },
  {
    venue: "NeurIPS 2025",
    title: "Neural Collapse under Gradient Flow",
    sub: "on Shallow ReLU Networks for Orthogonally Separable Data",
    authors: ["Hancheng Min","Zhihui Zhu","René Vidal"],
    desc: "Proves that gradient flow on shallow ReLU networks induces neural collapse for orthogonally separable data, characterizing the geometry of learned representations.",
    paper: "https://arxiv.org/abs/2510.21078",
    palette: ["#011F5B","#990000"],
    motif: "noise"
  }
];

window.PUBLICATIONS = [
  {tag:"NeurIPS 2025", title:"Conformal Information Pursuit for Interactively Guiding LLMs", authors:"Chan, Ge, Dobriban, Hassani, Vidal", motif:1},
  {tag:"ICCV 2025", title:"Voyaging into Perpetual Dynamic Scenes from a Single View", authors:"Tian, Ding, Luo, Min, Vidal", motif:2},
  {tag:"NeurIPS 2025", title:"SECA — Eliciting LLM Hallucinations with Semantically Equivalent Attacks", authors:"Liang, Peng, Luo, Thaker, Chan, Vidal", motif:3},
  {tag:"MICCAI 2025", title:"IP-CRR — Information Pursuit for Interpretable Chest Radiology", authors:"Ge, Chan, Messina, Vidal", motif:4},
  {tag:"CVPR 2025", title:"Disentangling Safe & Unsafe Corruptions via Anisotropy", authors:"Muthukumar, Pal, Sulam, Vidal", motif:5},
  {tag:"CVPR 2025", title:"Concept Lancet — Compositional Representation Transplant", authors:"Luo, Ding, Chan, Min, Callison-Burch, Vidal", motif:6},
  {tag:"IEEE TBME 2025", title:"CAMI-2DNet — Motor Imitation Assessment for Autism Screening", authors:"Kinfu, Pacheco, et al., Vidal", motif:7},
  {tag:"Preprint 2026", title:"Hierarchical Concept Embedding & Pursuit", authors:"Nguyen, Ding, Vidal", motif:8},
  {tag:"NeurIPS 2025", title:"Edge of Stability — Convergence Rates for Gradient Descent", authors:"MacDonald, Min, Palma, Tarmoun, Xu, Vidal", motif:9}
];

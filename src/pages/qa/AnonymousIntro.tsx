import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  ChatBubbleLeftRightIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  ArrowRightIcon,
  ArrowRightOnRectangleIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.2, duration: 0.5 },
  }),
};

const stepFadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.2, duration: 0.5 },
  }),
};

const AnonymousIntro = () => {
  const { t } = useTranslation();

  const featureCards = [
    {
      title: t("ask_anonymously"),
      description: t("ask_anonymously_desc"),
      icon: ChatBubbleLeftRightIcon,
    },
    {
      title: t("verified_responses"),
      description: t("verified_responses_desc"),
      icon: ShieldCheckIcon,
    },
    {
      title: t("community_support"),
      description: t("community_support_desc"),
      icon: UserGroupIcon,
    },
  ];

  const steps = [
    {
      title: t("ask_anonymously"),
      description: t("no_reg_needed"),
      icon: ChatBubbleLeftRightIcon,
      color: "#EDCF07",
    },
    {
      title: t("choose_category"),
      description: t("choose_category_desc"),
      icon: ArrowRightOnRectangleIcon,
      color: "#253D7F",
    },
    {
      title: t("receive_responses"),
      description: t("receive_responses_desc"),
      icon: ShieldCheckIcon,
      color: "#EDCF07",
    },
    {
      title: t("community_support"),
      description: t("peer_support_desc"),
      icon: UserGroupIcon,
      color: "#253D7F",
    },
  ];
  return (
    <div className="min-h-screen bg-[#F8FAFC] py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-[#253D7F] transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            {t("back_to_home", "Back to Home")}
          </Link>
        </div>
        
        {/* Hero / Intro Section */}
        <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-[#253D7F] mb-4">
            {t("emahoy_title")}
          </h1>
          <p className="text-[#253D7F] text-base mb-12 max-w-2xl mx-auto">
            {t("emahoy_subtitle")}
          </p>
        </motion.div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-12">
          {featureCards.map((card, index) => (
            <motion.div
              key={index}
              custom={index}
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              className="bg-white border border-slate-100 rounded-2xl p-6 flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-[#EDCF07] hover:bg-[#EDCF07]/10 group"
            >
              <div className="w-14 h-14 rounded-full bg-[#EDCF07] flex items-center justify-center mb-4 transition-colors duration-300 group-hover:bg-[#253D7F]">
                <card.icon className="h-7 w-7 text-[#253D7F] group-hover:text-[#EDCF07]" />
              </div>
              <h3 className="text-lg font-semibold text-[#253D7F] group-hover:text-[#EDCF07] mb-2">
                {card.title}
              </h3>
              <p className="text-sm text-slate-600 group-hover:text-[#253D7F]">
                {card.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.8 } }}
          className="mb-16 text-center"
        >
          <Link
            to="/anonymous/questions"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#253D7F] text-[#EDCF07] font-semibold text-sm hover:bg-[#1f3160] transition-colors duration-300"
          >
            {t("join_conversation")}
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </motion.div>

        {/* How It Works Section */}
        <section className="mt-16 text-center">
          <h2 className="text-2xl font-semibold text-[#253D7F] mb-10">
            {t("how_it_works")}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                custom={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={stepFadeIn}
                className="bg-white border border-slate-100 rounded-2xl p-6 flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-[#EDCF07] hover:bg-[#EDCF07]/10 group"
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-colors"
                  style={{ backgroundColor: step.color }}
                >
                  <step.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-lg text-[#253D7F] group-hover:text-[#EDCF07] mb-2 transition-colors">
                  {step.title}
                </h3>
                <p className="text-sm text-slate-600 group-hover:text-[#253D7F] transition-colors">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AnonymousIntro;

// app/DashboardPage.jsx
import React, { useContext, useEffect } from "react";
import DashboardCard from "./components/DashboardCard";
import TemplatesList from "@/features/template/TemplatesList";
import { IconApps, IconFileText, IconCircleCheck, IconClock } from "@tabler/icons-react";
import { AppContext } from "../demo/AppContext";
import { motion } from "framer-motion";

export default function DashboardPage() {
  const { myRequests, getMyRequests, requestsByOthers, getRequestsByOthers } = useContext(AppContext);

  useEffect(() => {
    getMyRequests();
    getRequestsByOthers();
  }, []);

  // Combine all requests related to the current user
  const allRequests = [...(myRequests || []), ...(requestsByOthers || [])];
  const requestCount = myRequests ? myRequests.length : 0;
  const successCount = allRequests.filter(r => r.status === "approved").length;
  const pendingCount = allRequests.filter(r => r.status === "pending").length;

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (index) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: index * 0.1,
        duration: 0.6,
        ease: "easeOut"
      }
    })
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <motion.div 
        className="glass-card p-8 text-center"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl font-bold gradient-text mb-2">Welcome to Digital Signature</h1>
        <p className="text-slate-600 dark:text-slate-400 text-lg">Manage your documents and signatures with ease</p>
      </motion.div>

      {/* Dashboard Stats */}
      <motion.div
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
      >
        <h2 className="text-2xl font-bold gradient-text mb-6">Dashboard Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div custom={0} variants={cardVariants}>
            <DashboardCard 
              title="All Requests" 
              count={allRequests.length} 
              icon={IconApps} 
              to="/requests" 
              gradient="from-blue-500 to-blue-600"
            />
          </motion.div>
          <motion.div custom={1} variants={cardVariants}>
            <DashboardCard 
              title="My Requests" 
              count={requestCount} 
              icon={IconFileText} 
              to="/requests" 
              gradient="from-indigo-500 to-indigo-600"
            />
          </motion.div>
          <motion.div custom={2} variants={cardVariants}>
            <DashboardCard 
              title="Approved" 
              count={successCount} 
              icon={IconCircleCheck} 
              to="/requests?status=approved" 
              gradient="from-green-500 to-green-600"
            />
          </motion.div>
          <motion.div custom={3} variants={cardVariants}>
            <DashboardCard 
              title="Pending" 
              count={pendingCount} 
              icon={IconClock} 
              to="/requests?status=pending" 
              gradient="from-amber-500 to-amber-600"
            />
          </motion.div>
        </div>
      </motion.div>

      {/* Templates Section */}
      <motion.div
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.2 }}
        className="glass-card p-6"
      >
        <h2 className="text-2xl font-bold gradient-text mb-6">Available Templates</h2>
        <TemplatesList />
      </motion.div>

      {/* Recent Templates Section */}
      <motion.div
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.4 }}
        className="glass-card p-6"
      >
        <h2 className="text-2xl font-bold gradient-text mb-6">Recent Templates</h2>
        <TemplatesList />
      </motion.div>
    </div>
  );
}

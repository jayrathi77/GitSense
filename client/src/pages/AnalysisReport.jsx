import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getAnalysis } from '../api/analysisApi';
import { ArrowLeft, Star, GitFork, Clock, TrendingUp, CheckCircle, BarChart3, Download, Trophy, Github, XCircle, Target, BookOpen, Building2, GraduationCap, Sparkles } from 'lucide-react';
import LanguageChart from '../components/charts/LanguageChart';
import RepoGrowthChart from '../components/charts/RepoGrowthChart';
import ScoreBreakdown, { SCORE_METRICS } from '../components/charts/ScoreBreakdown';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const AnalysisReport = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [darkMode] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const response = await getAnalysis(id);
        setAnalysis(response.data);
      } catch (error) {
        console.error('Failed to fetch analysis:', error);
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"
        />
      </div>
    );
  }

  if (!analysis) {
    return null;
  }

  const { profileSnapshot, scores, aiInsights, chartData, githubUsername } = analysis;

  const generatePDF = async () => {
    setPdfLoading(true);
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPos = 20;

      // Header
      doc.setFillColor(59, 130, 246);
      doc.rect(0, 0, pageWidth, 40, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('GitSense Analysis Report', pageWidth / 2, 25, { align: 'center' });

      yPos = 55;

      // Profile Section
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Profile Overview', 20, yPos);
      yPos += 10;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Username: ${githubUsername}`, 20, yPos);
      yPos += 7;
      doc.text(`Followers: ${profileSnapshot.followers}`, 20, yPos);
      yPos += 7;
      doc.text(`Following: ${profileSnapshot.following}`, 20, yPos);
      yPos += 7;
      doc.text(`Public Repositories: ${profileSnapshot.publicRepos}`, 20, yPos);
      yPos += 7;
      if (profileSnapshot.bio) {
        doc.text(`Bio: ${profileSnapshot.bio}`, 20, yPos);
        yPos += 7;
      }

      yPos += 10;

      // Recruiter Verdict
      if (aiInsights.recruiterVerdict) {
        doc.setFillColor(240, 249, 255);
        doc.rect(20, yPos - 5, pageWidth - 40, 20, 'F');
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('Recruiter Verdict:', 25, yPos + 5);
        doc.setFont('helvetica', 'normal');
        doc.text(aiInsights.recruiterVerdict, 25, yPos + 12);
        yPos += 25;
      }

      // Interview Readiness
      if (aiInsights.interviewReadiness) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`Interview Readiness: ${aiInsights.interviewReadiness}`, 20, yPos);
        yPos += 15;
      }

      // Overall Placement Score
      doc.setFillColor(59, 130, 246);
      doc.rect(20, yPos - 5, pageWidth - 40, 30, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Overall Placement Score', 30, yPos + 8);
      doc.setFontSize(28);
      doc.text(`${scores.overallPlacementScore}/100`, pageWidth - 40, yPos + 8);
      yPos += 35;

      doc.setTextColor(0, 0, 0);

      // Scores Table
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Detailed Scores', 20, yPos);
      yPos += 10;

      const scoreData = [
        ['Backend Score', scores.backendScore],
        ['Frontend Score', scores.frontendScore],
        ['Database Score', scores.databaseScore],
        ['GitHub Portfolio Score', scores.githubPortfolioScore],
        ['Documentation Score', scores.documentationScore],
        ['Project Quality Score', scores.projectQualityScore],
        ['Open Source Score', scores.openSourceScore],
      ];

      doc.autoTable({
        startY: yPos,
        head: [['Score Category', 'Value']],
        body: scoreData,
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246] },
        margin: { left: 20, right: 20 },
      });

      yPos = doc.lastAutoTable.finalY + 15;

      if (yPos > pageHeight - 130) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('Score Breakdown', 20, yPos);
      yPos += 12;

      const labelColWidth = 52;
      const scoreColWidth = 22;
      const barAreaWidth = pageWidth - 40 - labelColWidth - scoreColWidth - 4;
      const barStartX = 20 + labelColWidth;
      const barHeight = 5;
      const rowHeight = 11;

      SCORE_METRICS.forEach(({ key, label }) => {
        if (yPos > pageHeight - 20) {
          doc.addPage();
          yPos = 20;
        }

        const score = scores[key] ?? 0;
        const barY = yPos - 3;

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(80, 80, 80);
        doc.text(label, 20, yPos);

        doc.setFillColor(229, 231, 235);
        doc.roundedRect(barStartX, barY, barAreaWidth, barHeight, 1.5, 1.5, 'F');

        if (score > 0) {
          doc.setFillColor(59, 130, 246);
          doc.roundedRect(barStartX, barY, barAreaWidth * (score / 100), barHeight, 1.5, 1.5, 'F');
        }

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 30, 30);
        doc.text(`${score}/100`, barStartX + barAreaWidth + 4, yPos);

        yPos += rowHeight;
      });

      yPos += 2;
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.2);
      doc.line(barStartX, yPos, barStartX + barAreaWidth, yPos);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(128, 128, 128);
      [0, 25, 50, 75, 100].forEach((tick) => {
        const tickX = barStartX + (barAreaWidth * tick) / 100;
        const tickLabel = String(tick);
        const offset = tick === 0 ? 0 : tick === 100 ? 6 : 3;
        doc.text(tickLabel, tickX - offset, yPos + 5);
      });
      yPos += 14;

      // Language Distribution
      if (chartData?.languageDistribution && chartData.languageDistribution.length > 0) {
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('Language Distribution', 20, yPos);
        yPos += 10;

        const langData = chartData.languageDistribution.map(lang => [
          lang.language,
          `${lang.percentage}%`
        ]);

        doc.autoTable({
          startY: yPos,
          head: [['Language', 'Percentage']],
          body: langData,
          theme: 'striped',
          headStyles: { fillColor: [59, 130, 246] },
          margin: { left: 20, right: 20 },
        });

        yPos = doc.lastAutoTable.finalY + 15;
      }

      // Strengths
      if (aiInsights.strengths && aiInsights.strengths.length > 0) {
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('Strengths', 20, yPos);
        yPos += 10;

        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        aiInsights.strengths.forEach((strength, index) => {
          doc.text(`${index + 1}. ${strength}`, 25, yPos);
          yPos += 7;
        });
        yPos += 5;
      }

      // Weaknesses
      if (aiInsights.weaknesses && aiInsights.weaknesses.length > 0) {
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('Areas for Improvement', 20, yPos);
        yPos += 10;

        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        aiInsights.weaknesses.forEach((weakness, index) => {
          doc.text(`${index + 1}. ${weakness}`, 25, yPos);
          yPos += 7;
        });
        yPos += 5;
      }

      // Missing Skills
      if (aiInsights.missingSkills && aiInsights.missingSkills.length > 0) {
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('Missing Skills', 20, yPos);
        yPos += 10;

        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        aiInsights.missingSkills.forEach((skill, index) => {
          doc.text(`${index + 1}. ${skill}`, 25, yPos);
          yPos += 7;
        });
        yPos += 5;
      }

      // Recommended Technologies
      if (aiInsights.recommendedTechnologies && aiInsights.recommendedTechnologies.length > 0) {
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('Recommended Technologies', 20, yPos);
        yPos += 10;

        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        const techText = aiInsights.recommendedTechnologies.join(', ');
        const splitTech = doc.splitTextToSize(techText, pageWidth - 40);
        doc.text(splitTech, 25, yPos);
        yPos += splitTech.length * 7 + 5;
      }

      // 30-Day Learning Roadmap
      if (aiInsights.learningRoadmap && aiInsights.learningRoadmap.length > 0) {
        if (yPos > pageHeight - 50) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('30-Day Learning Roadmap', 20, yPos);
        yPos += 10;

        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        aiInsights.learningRoadmap.forEach((step, index) => {
          if (yPos > pageHeight - 20) {
            doc.addPage();
            yPos = 20;
          }
          const splitStep = doc.splitTextToSize(`${index + 1}. ${step}`, pageWidth - 40);
          doc.text(splitStep, 25, yPos);
          yPos += splitStep.length * 7 + 3;
        });
        yPos += 5;
      }

      // Suitable Roles
      if (aiInsights.suitableRoles && aiInsights.suitableRoles.length > 0) {
        if (yPos > pageHeight - 50) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('Suitable Roles', 20, yPos);
        yPos += 10;

        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        aiInsights.suitableRoles.forEach((role, index) => {
          if (yPos > pageHeight - 20) {
            doc.addPage();
            yPos = 20;
          }
          doc.text(`${index + 1}. ${role}`, 25, yPos);
          yPos += 7;
        });
        yPos += 5;
      }

      // Recommended Companies
      if (aiInsights.recommendedCompanies && aiInsights.recommendedCompanies.length > 0) {
        if (yPos > pageHeight - 50) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('Recommended Companies', 20, yPos);
        yPos += 10;

        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        const companiesText = aiInsights.recommendedCompanies.join(', ');
        const splitCompanies = doc.splitTextToSize(companiesText, pageWidth - 40);
        doc.text(splitCompanies, 25, yPos);
        yPos += splitCompanies.length * 7 + 5;
      }

      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(128, 128, 128);
        doc.text(
          `Generated on ${new Date().toLocaleDateString()} by GitSense`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
        doc.text(
          `Page ${i} of ${pageCount}`,
          pageWidth - 20,
          pageHeight - 10,
          { align: 'right' }
        );
      }

      doc.save('GitSense_Report.pdf');
      setToastMessage('PDF downloaded successfully!');
      setToastType('success');
      setShowToast(true);
    } catch (error) {
      setToastMessage('Failed to generate PDF. Please try again.');
      setToastType('error');
      setShowToast(true);
    } finally {
      setPdfLoading(false);
    }
  };

  const scoreItems = [
    { label: 'Overall Placement Score', value: scores.overallPlacementScore, color: 'bg-gradient-to-r from-blue-500 to-purple-500', isMain: true },
    { label: 'Backend Score', value: scores.backendScore, color: 'bg-blue-500' },
    { label: 'Frontend Score', value: scores.frontendScore, color: 'bg-pink-500' },
    { label: 'Database Score', value: scores.databaseScore, color: 'bg-green-500' },
    { label: 'GitHub Portfolio Score', value: scores.githubPortfolioScore, color: 'bg-gray-700' },
    { label: 'Documentation Score', value: scores.documentationScore, color: 'bg-yellow-500' },
    { label: 'Project Quality Score', value: scores.projectQualityScore, color: 'bg-purple-500' },
    { label: 'Open Source Score', value: scores.openSourceScore, color: 'bg-orange-500' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-4 right-4 px-6 py-4 rounded-xl shadow-2xl z-50 ${
              toastType === 'success' ? 'bg-green-500' : 'bg-red-500'
            } text-white font-medium`}
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-900/50 backdrop-blur-xl border-b border-gray-800"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/dashboard')}
              className="flex items-center text-gray-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Dashboard
            </motion.button>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {analysis.isCached ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Cached Result
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Fresh Analysis
                  </span>
                )}
                <div className="text-sm text-gray-400">
                  {new Date(analysis.createdAt).toLocaleDateString()}
                </div>
              </div>
              {/* PDF button removed */}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 mb-8 shadow-2xl"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full blur-xl opacity-50" />
              <img
                src={profileSnapshot.avatarUrl}
                alt={githubUsername}
                className="relative h-28 w-28 rounded-full ring-4 ring-gray-700 shadow-2xl"
              />
              <div className="absolute -bottom-2 -right-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full p-2 shadow-lg">
                <Github className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="text-4xl font-bold text-white mb-3"
              >
                {githubUsername}
              </motion.h1>
              {profileSnapshot.bio && (
                <motion.p 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-gray-400 mb-6 max-w-2xl text-lg"
                >
                  {profileSnapshot.bio}
                </motion.p>
              )}
              <div className="flex flex-wrap justify-center sm:justify-start gap-4 mb-6">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center px-4 py-2 bg-gray-700/50 rounded-xl border border-gray-600"
                >
                  <Star className="h-5 w-5 mr-2 text-yellow-400" />
                  <span className="font-semibold text-white">{profileSnapshot.followers}</span>
                  <span className="ml-2 text-gray-400 text-sm">followers</span>
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.45 }}
                  className="flex items-center px-4 py-2 bg-gray-700/50 rounded-xl border border-gray-600"
                >
                  <GitFork className="h-5 w-5 mr-2 text-blue-400" />
                  <span className="font-semibold text-white">{profileSnapshot.following}</span>
                  <span className="ml-2 text-gray-400 text-sm">following</span>
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center px-4 py-2 bg-gray-700/50 rounded-xl border border-gray-600"
                >
                  <Clock className="h-5 w-5 mr-2 text-green-400" />
                  <span className="font-semibold text-white">{profileSnapshot.publicRepos}</span>
                  <span className="ml-2 text-gray-400 text-sm">repos</span>
                </motion.div>
              </div>
              {aiInsights.recruiterVerdict && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-5 border border-blue-500/30"
                >
                  <p className="text-sm font-semibold text-blue-400 mb-2 flex items-center">
                    <Trophy className="h-4 w-4 mr-2" />
                    Recruiter Verdict
                  </p>
                  <p className="text-gray-300">{aiInsights.recruiterVerdict}</p>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Interview Readiness Badge */}
        {aiInsights.interviewReadiness && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 mb-8 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
                  <GraduationCap className="h-5 w-5 mr-2 text-purple-400" />
                  Interview Readiness
                </h3>
                <p className="text-gray-400">Assessment of technical interview preparation</p>
              </div>
              <div className={`px-6 py-3 rounded-full text-lg font-bold ${
                aiInsights.interviewReadiness === 'Ready' 
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                  : aiInsights.interviewReadiness === 'Needs Preparation'
                  ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}>
                {aiInsights.interviewReadiness}
              </div>
            </div>
          </motion.div>
        )}

        {/* Scores Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8"
        >
          {scoreItems.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 + index * 0.05 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className={`bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-2xl ${item.isMain ? 'sm:col-span-2 lg:col-span-2' : ''}`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-400">
                  {item.label}
                </span>
                <motion.span 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 + index * 0.05 }}
                  className={`text-3xl font-bold text-white ${item.isMain ? 'text-4xl' : ''}`}
                >
                  {item.value}
                </motion.span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${item.value}%` }}
                  transition={{ duration: 1, delay: 1.2 + index * 0.05, ease: 'easeOut' }}
                  className={`h-3 rounded-full ${item.color}`}
                ></motion.div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Visualizations */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
        >
          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <BarChart3 className="h-5 w-5 text-blue-400 mr-2" />
              Language Distribution
            </h3>
            <LanguageChart data={chartData?.languageDistribution} />
          </div>

          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 text-green-400 mr-2" />
              Repository Growth
            </h3>
            <RepoGrowthChart data={chartData?.repoGrowthByYear} />
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 mb-8 shadow-2xl"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Target className="h-5 w-5 text-purple-400 mr-2" />
            Score Breakdown
          </h3>
          <ScoreBreakdown scores={scores} />
        </motion.div>

        {/* AI Insights */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
        >
          {/* Strengths */}
          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
              Strengths
            </h3>
            <ul className="space-y-3">
              {aiInsights.strengths?.map((strength, index) => (
                <motion.li 
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.3 + index * 0.05 }}
                  className="flex items-start text-gray-300"
                >
                  <span className="text-green-400 mr-3 mt-1">✓</span>
                  {strength}
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Weaknesses */}
          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <XCircle className="h-5 w-5 text-red-400 mr-2" />
              Areas for Improvement
            </h3>
            <ul className="space-y-3">
              {aiInsights.weaknesses?.map((weakness, index) => (
                <motion.li 
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.3 + index * 0.05 }}
                  className="flex items-start text-gray-300"
                >
                  <span className="text-red-400 mr-3 mt-1">!</span>
                  {weakness}
                </motion.li>
              ))}
            </ul>
          </div>
        </motion.div>

        {/* Learning Roadmap & Recommendations */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
        >
          {/* 30-Day Learning Roadmap */}
          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <BookOpen className="h-5 w-5 text-purple-400 mr-2" />
              30-Day Learning Roadmap
            </h3>
            <ul className="space-y-3">
              {aiInsights.learningRoadmap?.map((step, index) => (
                <motion.li 
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.5 + index * 0.05 }}
                  className="flex items-start text-gray-300"
                >
                  <span className="bg-gradient-to-br from-purple-500 to-blue-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">
                    {index + 1}
                  </span>
                  {step}
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Recommended Technologies */}
          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Sparkles className="h-5 w-5 text-yellow-400 mr-2" />
              Recommended Technologies
            </h3>
            <div className="flex flex-wrap gap-2">
              {aiInsights.recommendedTechnologies?.map((tech, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.5 + index * 0.03 }}
                  whileHover={{ scale: 1.05 }}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 border border-blue-500/30 rounded-full text-sm cursor-pointer"
                >
                  {tech}
                </motion.span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Suitable Roles & Recommended Companies */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
        >
          {/* Suitable Roles */}
          {aiInsights.suitableRoles && aiInsights.suitableRoles.length > 0 && (
            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-2xl">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Target className="h-5 w-5 text-green-400 mr-2" />
                Suitable Roles
              </h3>
              <div className="space-y-3">
                {aiInsights.suitableRoles?.map((role, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.7 + index * 0.05 }}
                    whileHover={{ scale: 1.02, x: 5 }}
                    className="flex items-center p-3 bg-green-500/10 rounded-xl border border-green-500/30 cursor-pointer"
                  >
                    <CheckCircle className="h-4 w-4 text-green-400 mr-3" />
                    <span className="text-gray-300">{role}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Recommended Companies */}
          {aiInsights.recommendedCompanies && aiInsights.recommendedCompanies.length > 0 && (
            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-2xl">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Building2 className="h-5 w-5 text-purple-400 mr-2" />
                Recommended Companies
              </h3>
              <div className="flex flex-wrap gap-2">
                {aiInsights.recommendedCompanies?.map((company, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.7 + index * 0.03 }}
                    whileHover={{ scale: 1.05 }}
                    className="px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border border-purple-500/30 rounded-full text-sm cursor-pointer"
                  >
                    {company}
                  </motion.span>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AnalysisReport;

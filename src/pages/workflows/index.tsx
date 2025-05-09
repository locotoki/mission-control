import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import MainLayout from '../../components/layout/MainLayout';
import { format } from 'date-fns';
import { getWorkflowHistory, getScheduledWorkflows } from '../../services/youtube-workflows';
import { WorkflowHistory, WorkflowSchedule } from '../../types/youtube-workflows';

export default function Workflows() {
  const router = useRouter();
  
  // State for workflow data
  const [scheduledWorkflows, setScheduledWorkflows] = useState<WorkflowSchedule[]>([]);
  const [workflowHistory, setWorkflowHistory] = useState<WorkflowHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch workflow data function
  const fetchWorkflowData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch both scheduled workflows and history in parallel
      const [historyData, scheduledData] = await Promise.all([
        getWorkflowHistory(),
        getScheduledWorkflows()
      ]);
      
      setWorkflowHistory(historyData);
      setScheduledWorkflows(scheduledData);
      
      console.log('Fetched workflow history:', historyData);
      console.log('Fetched scheduled workflows:', scheduledData);
    } catch (err) {
      console.error('Error fetching workflow data:', err);
      setError('Failed to load workflow data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch data on component mount
  useEffect(() => {
    fetchWorkflowData();
  }, []);

  const renderWorkflowCard = (title, description, href) => (
    <div className="card p-6 h-full flex flex-col">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-4 flex-grow">
        {description}
      </p>
      <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        <p>Last run: May 5, 2025</p>
        <p>Status: Available</p>
      </div>
      <Link 
        href={href}
        className="btn-primary text-center"
      >
        RUN WORKFLOW
      </Link>
    </div>
  );

  return (
    <MainLayout title="Workflows">
      <div className="space-y-6">
        <div className="pb-5 border-b border-gray-200 dark:border-gray-700 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            YOUTUBE RESEARCH WORKFLOWS
          </h1>
        </div>

        {/* Workflow Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {renderWorkflowCard(
            "Niche-Scout",
            "Find trending YouTube niches with growth metrics",
            "/workflows/niche-scout"
          )}
          {renderWorkflowCard(
            "Seed-to-Blueprint",
            "Create channel strategy from seed video or niche",
            "/workflows/seed-to-blueprint"
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 p-4 rounded-md">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-10 w-10 rounded-full border-4 border-t-blue-500 border-r-transparent border-b-blue-700 border-l-blue-500 animate-spin"></div>
              <p className="mt-3 text-gray-600 dark:text-gray-400">Loading workflow data...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Scheduled Runs */}
            <div className="card p-4">
              <h2 className="text-lg font-semibold mb-4">Scheduled Runs</h2>
              {scheduledWorkflows.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">No scheduled workflows found.</p>
              ) : (
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Time</th>
                        <th>Workflow</th>
                        <th>Parameters</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {scheduledWorkflows.map((workflow, index) => (
                        <tr key={index}>
                          <td>{workflow.frequency}</td>
                          <td>{workflow.workflow_type === 'niche-scout' ? 'Niche-Scout' : 'Seed-to-Blueprint'}</td>
                          <td>
                            {workflow.parameters && Object.entries(workflow.parameters)
                              .filter(([_, value]) => value)
                              .map(([key, value]) => `${value}`)
                              .join(', ')}
                          </td>
                          <td><span className="status-scheduled">⏱ Scheduled</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Workflow History */}
            <div className="card p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Workflow History</h2>
                <button 
                  onClick={() => fetchWorkflowData()}
                  className="btn-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
              </div>
              
              {workflowHistory.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">No workflow history found.</p>
              ) : (
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Time</th>
                        <th>Workflow</th>
                        <th>Parameters</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {workflowHistory.map((workflow, index) => (
                        <tr key={index}>
                          <td>{workflow.started_at ? format(new Date(workflow.started_at), 'MMM d') : 'N/A'}</td>
                          <td>{workflow.workflow_type === 'niche-scout' ? 'Niche-Scout' : 'Seed-to-Blueprint'}</td>
                          <td>
                            {workflow.parameters && Object.entries(workflow.parameters)
                              .filter(([_, value]) => value)
                              .map(([key, value]) => `${value}`)
                              .join(', ')}
                          </td>
                          <td>
                            {workflow.status === 'completed' && (
                              <span className="status-completed">✓ Completed</span>
                            )}
                            {workflow.status === 'running' && (
                              <span className="status-pending">⟳ Running</span>
                            )}
                            {workflow.status === 'error' && (
                              <span className="status-error">✗ Error</span>
                            )}
                          </td>
                          <td>
                            {workflow.status === 'completed' && (
                              <button
                                onClick={() => router.push(`/workflows/${workflow.workflow_type}/results/${workflow.id}`)}
                                className="btn-sm bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded px-2 py-1"
                              >
                                View Results
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}
import React, { useState } from 'react';
import { Space, Button, Card, Typography, List, message, Tag } from 'antd';
import { Lightbulb } from '@mui/icons-material';
import ProjectScopeSection from './ProjectScopeSection';
import PaymentTermsSection from './PaymentTermsSection';
import ChangeRequestSection from './ChangeRequestSection';
import DeliveryNotesSection from './DeliveryNotesSection';
import OpenAI from 'openai';

const { Title, Text } = Typography;

// Initialize OpenAI client
const openAIClient = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

const SmartProjectInsights = ({ projectId }) => {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [changeRequests, setChangeRequests] = useState([]);
  const [scopeItems, setScopeItems] = useState([]);
  const [paymentTerms, setPaymentTerms] = useState([]);

  const handlePOChange = (updatedPOs) => {
    setPurchaseOrders(updatedPOs);
  };

  const handleCRChange = (updatedCRs) => {
    setChangeRequests(updatedCRs);
  };

  const handleScopeChange = (updatedScopeItems) => {
    setScopeItems(updatedScopeItems);
  };

  const handlePaymentTermsChange = (updatedPaymentTerms) => {
    setPaymentTerms(updatedPaymentTerms);
  };

  const getLinkedItemsDisplay = (items) => {
    return (
      <Space direction="vertical" size="small">
        {items.linkedPOs?.length > 0 && (
          <div>
            <Text type="secondary" style={{ fontSize: '12px' }}>Purchase Orders:</Text>
            <div style={{ marginTop: '4px' }}>
              {items.linkedPOs.map(poNumber => (
                <Tag color="blue" key={poNumber}>
                  PO: {poNumber} {purchaseOrders.find(po => po.poNumber === poNumber)?.title || ''}
                </Tag>
              ))}
            </div>
          </div>
        )}
        {items.linkedCRs?.length > 0 && (
          <div>
            <Text type="secondary" style={{ fontSize: '12px' }}>Change Requests:</Text>
            <div style={{ marginTop: '4px' }}>
              {items.linkedCRs.map(crNumber => (
                <Tag color="purple" key={crNumber}>
                  CR: {crNumber} {changeRequests.find(cr => cr.crNumber === crNumber)?.title || ''}
                </Tag>
              ))}
            </div>
          </div>
        )}
        {items.linkedScopeItems?.length > 0 && (
          <div>
            <Text type="secondary" style={{ fontSize: '12px' }}>Scope Items:</Text>
            <div style={{ marginTop: '4px' }}>
              {items.linkedScopeItems.map(id => {
                const item = scopeItems.find(s => s.id === id);
                return item ? (
                  <Tag color="green" key={id} style={{ margin: '2px' }}>
                    {item.number && `#${item.number}`}{item.label ? ` - ${item.label}` : ''}Scope: {item.title}
                  </Tag>
                ) : null;
              })}
            </div>
          </div>
        )}
        {items.linkedPaymentTerms?.length > 0 && (
          <div>
            <Text type="secondary" style={{ fontSize: '12px' }}>Payment Terms:</Text>
            <div style={{ marginTop: '4px' }}>
              {items.linkedPaymentTerms.map(termId => {
                const term = paymentTerms.find(p => p.id === termId);
                return (
                  <Tag color="gold" key={termId}>
                    Payment: {term?.milestone || ''} {term?.title || ''}
                  </Tag>
                );
              })}
            </div>
          </div>
        )}
      </Space>
    );
  };

  const generateWorkflowSuggestions = async () => {
    setLoading(true);
    try {
      const response = await openAIClient.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a project management expert. Analyze the project state and provide actionable workflow suggestions."
          },
          {
            role: "user",
            content: `Please provide 3-5 workflow suggestions for project ID: ${projectId}. Focus on:
              1. Project scope optimization
              2. Payment milestone alignment
              3. Change request efficiency
              4. Delivery process improvements`
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      const suggestions = response.choices[0].message.content
        .split('\n')
        .filter(line => line.trim().length > 0);

      setSuggestions(suggestions);
    } catch (error) {
      console.error('Error generating suggestions:', error);
      message.error('Failed to generate workflow suggestions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Space direction="vertical" size="large" style={{ width: '100%', padding: '20px' }}>
      <Card style={{ width: '100%' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: 16,
              width: '100%'
            }}>
            <Title level={4} style={{ margin: 0 }}>AI Workflow Suggestions</Title>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'flex-end' }}>
              <Button 
                type="primary"
                icon={<Lightbulb style={{ fontSize: '16px' }} />}
                onClick={generateWorkflowSuggestions}
                loading={loading}
                style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  gap: 8,
                  height: '32px',
                  padding: '4px 15px',
                  fontSize: '14px'
                }}
              >
                Generate Suggestions
              </Button>
            </div>
          </div>
          {suggestions.length > 0 && (
            <List
              dataSource={suggestions}
              renderItem={(item, index) => (
                <List.Item style={{ padding: '12px 0' }}>
                  <Text>{item}</Text>
                </List.Item>
              )}
            />
          )}
        </Space>
      </Card>

      <ChangeRequestSection 
        projectId={projectId} 
        onPOChange={handlePOChange}
        onCRChange={handleCRChange}
        style={{ width: '100%' }}
      />
      
      <ProjectScopeSection 
        projectId={projectId}
        purchaseOrders={purchaseOrders}
        changeRequests={changeRequests}
        onScopeChange={handleScopeChange}
        style={{ width: '100%' }}
      />
      
      <PaymentTermsSection 
        projectId={projectId}
        purchaseOrders={purchaseOrders}
        changeRequests={changeRequests}
        scopeItems={scopeItems}
        onPaymentTermsChange={handlePaymentTermsChange}
        style={{ width: '100%' }}
      />
      
      <DeliveryNotesSection 
        projectId={projectId}
        purchaseOrders={purchaseOrders}
        changeRequests={changeRequests}
        scopeItems={scopeItems}
        paymentTerms={paymentTerms}
        style={{ width: '100%' }}
      />
    </Space>
  );
};

export default SmartProjectInsights;

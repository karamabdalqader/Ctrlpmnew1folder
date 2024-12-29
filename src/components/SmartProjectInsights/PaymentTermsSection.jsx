import React, { useState } from 'react';
import { Card, Table, Button, Modal, Form, Input, Space, Typography, Tag, Upload, message, Select, InputNumber, Tooltip } from 'antd';
import { 
  Add as PlusOutlined, 
  Upload as UploadIcon, 
  Delete as DeleteIcon,
  Download as DownloadIcon,
  CheckCircle as CheckCircleIcon,
  Send as SendIcon
} from '@mui/icons-material';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const PaymentTermsSection = ({ 
  projectId, 
  purchaseOrders = [], 
  changeRequests = [], 
  scopeItems = [],
  onPaymentTermsChange
}) => {
  const [paymentTerms, setPaymentTerms] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [selectedLinkType, setSelectedLinkType] = useState('po');

  const updatePaymentTerms = (newPaymentTerms) => {
    setPaymentTerms(newPaymentTerms);
    onPaymentTermsChange?.(newPaymentTerms);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft':
        return 'default';
      case 'sent':
        return 'processing';
      case 'received':
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'draft':
        return 'Draft';
      case 'sent':
        return 'Invoice Sent';
      case 'received':
        return 'Payment Received';
      default:
        return status.toUpperCase();
    }
  };

  // Function to get scope item details by ID
  const getScopeItemDetails = (scopeItemIds) => {
    if (!scopeItemIds) return [];
    return scopeItemIds.map(id => {
      const item = scopeItems.find(s => s.id === id);
      return item ? {
        id: item.id,
        description: item.description,
        title: item.title,
        number: item.number,
        label: item.label,
        breakdown: item.breakdown
      } : null;
    }).filter(Boolean);
  };

  const handleInvoiceUpload = (file, record) => {
    const currentDate = new Date().toISOString();
    updatePaymentTerms(paymentTerms.map(term => {
      if (term.id === record.id) {
        return {
          ...term,
          status: 'sent',
          dateSent: currentDate,
          invoice: {
            name: file.name,
            file: file,
            uploadDate: currentDate
          }
        };
      }
      return term;
    }));
    message.success('Invoice uploaded and status set to sent');
    return false;
  };

  const handleDownloadInvoice = (record) => {
    if (record.invoice?.file) {
      // Create a URL for the file
      const url = URL.createObjectURL(record.invoice.file);
      // Create a temporary link and click it
      const a = document.createElement('a');
      a.href = url;
      a.download = record.invoice.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleStatusChange = (id, newStatus) => {
    updatePaymentTerms(paymentTerms.map(term => {
      if (term.id === id) {
        const updates = { status: newStatus };
        if (newStatus === 'sent') {
          updates.dateSent = new Date().toISOString();
        } else if (newStatus === 'received') {
          updates.dateReceived = new Date().toISOString();
        }
        return { ...term, ...updates };
      }
      return term;
    }));
    message.success(`Status updated to ${newStatus}`);
  };

  const handleAdd = (values) => {
    const newPaymentTerm = {
      id: Date.now(),
      ...values,
      status: 'draft'
    };
    updatePaymentTerms([...paymentTerms, newPaymentTerm]);
    message.success('Payment term added');
  };

  const handleDelete = (id) => {
    updatePaymentTerms(paymentTerms.filter(p => p.id !== id));
    message.success('Payment term deleted');
  };

  const columns = [
    {
      title: 'Milestone',
      dataIndex: 'milestone',
      key: 'milestone',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => (
        <span style={{ color: '#52c41a', fontWeight: 'bold' }}>
          SAR {amount?.toLocaleString()}
        </span>
      ),
    },
    {
      title: 'Percentage',
      dataIndex: 'percentage',
      key: 'percentage',
      render: (percentage) => `${percentage}%`,
    },
    {
      title: 'Linked To',
      key: 'linkedTo',
      render: (_, record) => (
        <Space direction="vertical" size="small">
          {record.linkedPO && (
            <div>
              <Text type="secondary" style={{ fontSize: '12px' }}>Purchase Orders:</Text>
              <div style={{ marginTop: '4px' }}>
                <Tag color="blue">
                  PO: {record.linkedPO} {purchaseOrders.find(po => po.poNumber === record.linkedPO)?.title || ''}
                </Tag>
              </div>
            </div>
          )}
          {record.linkedCR && (
            <div>
              <Text type="secondary" style={{ fontSize: '12px' }}>Change Requests:</Text>
              <div style={{ marginTop: '4px' }}>
                <Tag color="purple">
                  CR: {record.linkedCR} {changeRequests.find(cr => cr.crNumber === record.linkedCR)?.title || ''}
                </Tag>
              </div>
            </div>
          )}
          {record.linkedScopeItems?.length > 0 && (
            <div>
              <Text type="secondary" style={{ fontSize: '12px' }}>Scope Items:</Text>
              <div style={{ marginTop: '4px' }}>
                {getScopeItemDetails(record.linkedScopeItems).map((item) => (
                  <Tag color="green" key={item.id} style={{ margin: '2px' }}>
                    {item.number && `#${item.number}`}{item.label ? ` - ${item.label}` : ''}Scope: {item.title}
                  </Tag>
                ))}
              </div>
            </div>
          )}
        </Space>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => (
        <Space direction="vertical" size="small">
          <Tag color={getStatusColor(status)}>
            {getStatusText(status)}
          </Tag>
          {record.dateSent && (
            <div style={{ fontSize: '12px' }}>
              <Text type="secondary">Sent: </Text>
              {new Date(record.dateSent).toLocaleDateString()}
            </div>
          )}
          {record.dateReceived && (
            <div style={{ fontSize: '12px' }}>
              <Text type="secondary">Received: </Text>
              {new Date(record.dateReceived).toLocaleDateString()}
            </div>
          )}
        </Space>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small" style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Upload
            accept=".pdf,.doc,.docx"
            beforeUpload={(file) => handleInvoiceUpload(file, record)}
            showUploadList={false}
          >
            <Button
              icon={<UploadIcon style={{ fontSize: '16px' }} />}
              style={{ 
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                height: '32px'
              }}
            >
              Upload Invoice
            </Button>
          </Upload>
          {record.invoice && (
            <>
              <Button
                icon={<DownloadIcon style={{ fontSize: '16px' }} />}
                onClick={() => handleDownloadInvoice(record)}
                style={{ 
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  height: '32px'
                }}
              >
                Download
              </Button>
              {record.status === 'sent' && (
                <Button
                  type="primary"
                  icon={<CheckCircleIcon style={{ fontSize: '16px' }} />}
                  onClick={() => handleStatusChange(record.id, 'received')}
                  style={{ 
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    height: '32px'
                  }}
                >
                  Mark Received
                </Button>
              )}
            </>
          )}
          <Button
            type="primary"
            danger
            icon={<DeleteIcon style={{ fontSize: '16px' }} />}
            onClick={() => handleDelete(record.id)}
            style={{ 
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              height: '32px',
              width: '32px',
              padding: 0
            }}
          />
        </Space>
      ),
      width: '300px'
    },
  ];

  const calculateAmount = (percentage, linkType, linkId) => {
    if (linkType === 'po') {
      const po = purchaseOrders.find(po => po.poNumber === linkId);
      return po ? (po.amount * percentage / 100) : 0;
    } else if (linkType === 'cr') {
      const cr = changeRequests.find(cr => cr.crNumber === linkId);
      return cr ? (cr.amount * percentage / 100) : 0;
    }
    return 0;
  };

  return (
    <Card title="Payment Terms">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setIsModalVisible(true);
            form.resetFields();
            setSelectedLinkType('po');
          }}
          style={{ 
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            height: '32px'
          }}
        >
          Add Payment Term
        </Button>
      </div>

      <Table columns={columns} dataSource={paymentTerms} />

      <Modal
        title="Add Payment Term"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => {
            const amount = calculateAmount(values.percentage, selectedLinkType, values[selectedLinkType === 'po' ? 'linkedPO' : 'linkedCR']);
            const newPaymentTerm = {
              id: Date.now(),
              milestone: values.milestone,
              description: values.description,
              percentage: values.percentage,
              amount: amount,
              status: 'draft',
              linkedPO: selectedLinkType === 'po' ? values.linkedPO : null,
              linkedCR: selectedLinkType === 'cr' ? values.linkedCR : null,
              linkedScopeItems: values.linkedScopeItems,
            };
            handleAdd(newPaymentTerm);
            setIsModalVisible(false);
            form.resetFields();
          }}
        >
          <Form.Item
            name="milestone"
            label="Milestone"
            rules={[{ required: true, message: 'Please enter milestone' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter description' }]}
          >
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item label="Link Type">
            <Select
              value={selectedLinkType}
              onChange={(value) => {
                setSelectedLinkType(value);
                form.setFieldsValue({
                  linkedPO: undefined,
                  linkedCR: undefined,
                  percentage: undefined
                });
              }}
            >
              <Option value="po">Purchase Order</Option>
              <Option value="cr">Change Request</Option>
            </Select>
          </Form.Item>

          {selectedLinkType === 'po' && (
            <Form.Item
              name="linkedPO"
              label="Link to Purchase Order"
              rules={[{ required: true, message: 'Please select a Purchase Order' }]}
            >
              <Select placeholder="Select PO">
                {purchaseOrders.map(po => (
                  <Option key={po.id} value={po.poNumber}>
                    {po.poNumber} - SAR {po.amount?.toLocaleString()}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}

          {selectedLinkType === 'cr' && (
            <Form.Item
              name="linkedCR"
              label="Link to Change Request"
              rules={[{ required: true, message: 'Please select a Change Request' }]}
            >
              <Select placeholder="Select CR">
                {changeRequests.map(cr => (
                  <Option key={cr.id} value={cr.crNumber}>
                    {cr.crNumber} - SAR {cr.amount?.toLocaleString()}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}

          <Form.Item
            name="linkedScopeItems"
            label="Link to Scope Items"
            rules={[{ required: true, message: 'Please select at least one scope item' }]}
          >
            <Select
              mode="multiple"
              placeholder="Select Scope Items"
              style={{ width: '100%' }}
              optionFilterProp="children"
              showSearch
            >
              {scopeItems.map(item => (
                <Option key={item.id} value={item.id}>
                  {item.description}
                  {item.breakdown && item.breakdown.map((b, index) => (
                    <div key={index} style={{ paddingLeft: '20px', fontSize: '12px', color: '#666' }}>
                      - {b.description}
                    </div>
                  ))}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="percentage"
            label="Percentage"
            rules={[{ required: true, message: 'Please enter percentage' }]}
          >
            <InputNumber
              min={0}
              max={100}
              formatter={value => `${value}%`}
              parser={value => value.replace('%', '')}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Add Payment Term
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default PaymentTermsSection;

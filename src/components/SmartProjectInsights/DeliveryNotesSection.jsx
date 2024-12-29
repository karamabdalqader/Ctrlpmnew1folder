import React, { useState } from 'react';
import { Card, Table, Button, Modal, Form, Input, Select, Space, Typography, Tag, Upload, message, Divider, Tooltip } from 'antd';
import { Add as PlusOutlined, Upload as UploadIcon, Delete as DeleteIcon, Download as DownloadIcon } from '@mui/icons-material';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const deliveryMethods = [
  { label: 'Email', value: 'email' },
  { label: 'Etimad', value: 'etimad' },
  { label: 'Platform', value: 'platform' },
  { label: 'Custom', value: 'custom' },
];

const DeliveryNotesSection = ({ 
  projectId, 
  purchaseOrders = [], 
  changeRequests = [], 
  scopeItems = [], 
  paymentTerms = [] 
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [deliveryNotes, setDeliveryNotes] = useState([]);
  const [customMethod, setCustomMethod] = useState('');

  const handleFileUpload = (file, noteId, type) => {
    const now = new Date().toISOString();
    setDeliveryNotes(deliveryNotes.map(note => {
      if (note.id === noteId) {
        const updatedNote = {
          ...note,
          [type]: {
            name: file.name,
            file: file,
            uploadDate: now
          }
        };

        // If attaching the initial DN document, mark as sent
        if (type === 'attachments' && !note.attachments) {
          updatedNote.status = 'sent';
          updatedNote.dateSent = now;
          message.success('Delivery Note attached and marked as sent');
        }
        
        // If attaching a signature, mark as signed
        if (type === 'signature') {
          updatedNote.status = 'signed';
          updatedNote.dateSigned = now;
          message.success('Signed Delivery Note attached and status updated');
        }

        return updatedNote;
      }
      return note;
    }));
    return false;
  };

  const handleDownload = (record, type) => {
    const fileData = type === 'signature' ? record.signature : record.attachments;
    if (fileData?.file) {
      const url = URL.createObjectURL(fileData.file);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileData.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const getLinkedItemsDisplay = (note) => {
    return (
      <Space direction="vertical" size="small">
        {note.linkedPO && (
          <div>
            <Text type="secondary" style={{ fontSize: '12px' }}>Purchase Orders:</Text>
            <div style={{ marginTop: '4px' }}>
              <Tag color="blue">
                PO: {note.linkedPO} {purchaseOrders.find(po => po.poNumber === note.linkedPO)?.title || ''}
              </Tag>
            </div>
          </div>
        )}
        {note.linkedCR && (
          <div>
            <Text type="secondary" style={{ fontSize: '12px' }}>Change Requests:</Text>
            <div style={{ marginTop: '4px' }}>
              <Tag color="purple">
                CR: {note.linkedCR} {changeRequests.find(cr => cr.crNumber === note.linkedCR)?.title || ''}
              </Tag>
            </div>
          </div>
        )}
        {note.linkedScopeItems?.length > 0 && (
          <div>
            <Text type="secondary" style={{ fontSize: '12px' }}>Scope Items:</Text>
            <div style={{ marginTop: '4px' }}>
              {note.linkedScopeItems.map(id => {
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
        {note.linkedPaymentTerm && (
          <div>
            <Text type="secondary" style={{ fontSize: '12px' }}>Payment Terms:</Text>
            <div style={{ marginTop: '4px' }}>
              <Tag color="gold">
                Payment: {paymentTerms.find(p => p.id === note.linkedPaymentTerm)?.milestone || ''}
                {' '}{paymentTerms.find(p => p.id === note.linkedPaymentTerm)?.title || ''}
              </Tag>
            </div>
          </div>
        )}
      </Space>
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'sent':
        return 'processing';
      case 'signed':
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'sent':
        return 'DN Sent';
      case 'signed':
        return 'DN Signed';
      default:
        return status.toUpperCase();
    }
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      width: '15%',
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{text}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>{record.method}</Text>
        </Space>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: '20%',
    },
    {
      title: 'Linked Items',
      key: 'linkedItems',
      width: '25%',
      render: (_, record) => getLinkedItemsDisplay(record),
    },
    {
      title: 'Date Sent',
      dataIndex: 'dateSent',
      key: 'dateSent',
      width: '12%',
      render: (date) => date ? dayjs(date).format('DD/MM/YYYY HH:mm') : '-',
    },
    {
      title: 'Date Signed',
      dataIndex: 'dateSigned',
      key: 'dateSigned',
      width: '12%',
      render: (date) => date ? dayjs(date).format('DD/MM/YYYY HH:mm') : '-',
    },
    {
      title: 'Status',
      key: 'status',
      width: '8%',
      render: (_, record) => (
        <Tag color={getStatusColor(record.status)}>
          {getStatusText(record.status)}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small" style={{ display: 'flex', justifyContent: 'flex-end' }}>
          {!record.attachments ? (
            <Upload
              accept=".pdf,.doc,.docx"
              beforeUpload={(file) => handleFileUpload(file, record.id, 'attachments')}
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
                Attach DN
              </Button>
            </Upload>
          ) : (
            <Space direction="vertical" size="small" style={{ display: 'flex', alignItems: 'flex-end' }}>
              <Button 
                icon={<DownloadIcon style={{ fontSize: '16px' }} />}
                onClick={() => handleDownload(record, 'attachments')}
                style={{ 
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  height: '32px'
                }}
              >
                Download DN
              </Button>
              {record.status === 'sent' && (
                <Upload
                  accept=".pdf"
                  beforeUpload={(file) => handleFileUpload(file, record.id, 'signature')}
                  showUploadList={false}
                >
                  <Button 
                    type="primary"
                    icon={<UploadIcon style={{ fontSize: '16px' }} />}
                    style={{ 
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      height: '32px'
                    }}
                  >
                    Upload Signed
                  </Button>
                </Upload>
              )}
              {record.signature && (
                <Button 
                  icon={<DownloadIcon style={{ fontSize: '16px' }} />}
                  onClick={() => handleDownload(record, 'signature')}
                  style={{ 
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    height: '32px'
                  }}
                >
                  Download Signed
                </Button>
              )}
            </Space>
          )}
          <Button
            type="primary"
            danger
            icon={<DeleteIcon style={{ fontSize: '16px' }} />}
            onClick={() => {
              setDeliveryNotes(deliveryNotes.filter(n => n.id !== record.id));
              message.success('Delivery note deleted');
            }}
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

  return (
    <Card title="Delivery Notes">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalVisible(true)}
          style={{ 
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            height: '32px'
          }}
        >
          Add Delivery Note
        </Button>
      </div>

      <Table 
        columns={columns} 
        dataSource={deliveryNotes}
        rowKey="id"
        pagination={false}
      />

      <Modal
        title="Add Delivery Note"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => {
            const newNote = {
              id: Date.now(),
              title: values.title,
              description: values.description,
              method: values.method === 'custom' ? customMethod : values.method,
              status: 'pending',
              linkedPO: values.linkedPO,
              linkedCR: values.linkedCR,
              linkedScopeItems: values.linkedScopeItems,
              linkedPaymentTerm: values.linkedPaymentTerm
            };
            setDeliveryNotes([...deliveryNotes, newNote]);
            setIsModalVisible(false);
            form.resetFields();
            setCustomMethod('');
          }}
        >
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: 'Please enter title' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="method"
            label="Delivery Method"
            rules={[{ required: true, message: 'Please select delivery method' }]}
          >
            <Select onChange={(value) => {
              if (value === 'custom') {
                form.setFieldsValue({ method: 'custom' });
              }
            }}>
              {deliveryMethods.map(method => (
                <Option key={method.value} value={method.value}>
                  {method.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {form.getFieldValue('method') === 'custom' && (
            <Form.Item
              label="Custom Method"
              rules={[{ required: true, message: 'Please enter custom method' }]}
            >
              <Input
                value={customMethod}
                onChange={(e) => setCustomMethod(e.target.value)}
                placeholder="Enter custom delivery method"
              />
            </Form.Item>
          )}

          <Form.Item
            name="linkedPO"
            label="Purchase Order"
          >
            <Select placeholder="Select Purchase Order" allowClear>
              {purchaseOrders.map(po => (
                <Option key={po.id} value={po.poNumber}>
                  PO: {po.poNumber} {po.title}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="linkedCR"
            label="Change Request"
          >
            <Select placeholder="Select Change Request" allowClear>
              {changeRequests.map(cr => (
                <Option key={cr.id} value={cr.crNumber}>
                  CR: {cr.crNumber} {cr.title}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="linkedScopeItems"
            label="Scope Items"
          >
            <Select
              mode="multiple"
              placeholder="Select Scope Items"
              allowClear
              style={{ width: '100%' }}
              optionFilterProp="children"
            >
              {scopeItems.map(item => (
                <Option key={item.id} value={item.id}>
                  {item.number && `#${item.number}`}{item.label ? ` - ${item.label}` : ''}Scope: {item.title}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="linkedPaymentTerm"
            label="Payment Term"
          >
            <Select placeholder="Select Payment Term" allowClear>
              {paymentTerms.map(payment => (
                <Option key={payment.id} value={payment.id}>
                  Payment: {payment.milestone} {payment.title}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter description' }]}
          >
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Add Delivery Note
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default DeliveryNotesSection;

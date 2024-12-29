import React, { useState } from 'react';
import * as antd from 'antd';
import AddIcon from '@mui/icons-material/Add';
import UploadIcon from '@mui/icons-material/Upload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import { DownloadOutlined } from '@ant-design/icons';

const { Title, Text } = antd.Typography;
const { TextArea } = antd.Input;
const { Option } = antd.Select;

const ChangeRequestSection = ({ projectId, onPOChange, onCRChange }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('po');
  const [form] = antd.Form.useForm();
  const [changeRequests, setChangeRequests] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [attachments, setAttachments] = useState({}); // Store attachments

  const generatePONumber = () => {
    const prefix = 'PO';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}-${timestamp}-${random}`;
  };

  const generateCRNumber = () => {
    const prefix = 'CR';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}-${timestamp}-${random}`;
  };

  const poColumns = [
    {
      title: 'PO Number',
      dataIndex: 'poNumber',
      key: 'poNumber',
      render: (text) => (
        <Text strong>{text}</Text>
      ),
    },
    {
      title: 'Date Received',
      dataIndex: 'dateReceived',
      key: 'dateReceived',
      render: (date) => (
        <Text>{date ? new Date(date).toLocaleDateString() : '-'}</Text>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: '30%',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => (
        <Text strong style={{ color: '#52c41a' }}>
          SAR {amount.toLocaleString()}
        </Text>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <antd.Space size="middle" style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <antd.Upload
            accept=".pdf,.doc,.docx"
            beforeUpload={(file) => {
              const newAttachments = { ...attachments };
              if (!newAttachments[record.id]) {
                newAttachments[record.id] = [];
              }
              newAttachments[record.id].push(file);
              setAttachments(newAttachments);
              
              // Update PO status to approved when file is attached
              setPurchaseOrders(prevPOs => prevPOs.map(po => 
                po.id === record.id ? { ...po, status: 'approved' } : po
              ));
              
              antd.message.success(`${file.name} attached to PO ${record.poNumber}`);
              return false;
            }}
          >
            <antd.Button 
              icon={<UploadIcon style={{ fontSize: '16px' }} />}
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
              Attach PO
            </antd.Button>
          </antd.Upload>
          {attachments[record.id]?.length > 0 && (
            <antd.Dropdown
              menu={{
                items: attachments[record.id].map((file, index) => ({
                  key: index,
                  label: (
                    <a
                      onClick={() => {
                        const url = URL.createObjectURL(file);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = file.name;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                      }}
                    >
                      {file.name}
                    </a>
                  ),
                })),
              }}
            >
              <antd.Button 
                icon={<DownloadOutlined style={{ fontSize: '16px' }} />}
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
                Downloads
              </antd.Button>
            </antd.Dropdown>
          )}
        </antd.Space>
      ),
    },
  ];

  const crColumns = [
    {
      title: 'CR Number',
      dataIndex: 'crNumber',
      key: 'crNumber',
      render: (text) => (
        <Text strong>{text}</Text>
      ),
    },
    {
      title: 'Date Received',
      dataIndex: 'dateReceived',
      key: 'dateReceived',
      render: (date) => (
        <Text>{date ? new Date(date).toLocaleDateString() : '-'}</Text>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: '30%',
    },
    {
      title: 'Related PO',
      dataIndex: 'relatedPO',
      key: 'relatedPO',
      render: (po) => po ? <antd.Tag color="blue">{po}</antd.Tag> : '-',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => (
        <Text strong style={{ color: '#52c41a' }}>
          SAR {amount?.toLocaleString() || '0'}
        </Text>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <antd.Space size="middle" style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <antd.Upload
            accept=".pdf,.doc,.docx"
            beforeUpload={(file) => {
              const newAttachments = { ...attachments };
              if (!newAttachments[record.id]) {
                newAttachments[record.id] = [];
              }
              newAttachments[record.id].push(file);
              setAttachments(newAttachments);
              
              // Update CR status to approved when file is attached
              setChangeRequests(prevCRs => prevCRs.map(cr => 
                cr.id === record.id ? { ...cr, status: 'approved' } : cr
              ));
              
              antd.message.success(`${file.name} attached to CR ${record.crNumber}`);
              return false;
            }}
          >
            <antd.Button 
              icon={<UploadIcon style={{ fontSize: '16px' }} />}
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
              Attach CR
            </antd.Button>
          </antd.Upload>
          {attachments[record.id]?.length > 0 && (
            <antd.Dropdown
              menu={{
                items: attachments[record.id].map((file, index) => ({
                  key: index,
                  label: (
                    <a
                      onClick={() => {
                        const url = URL.createObjectURL(file);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = file.name;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                      }}
                    >
                      {file.name}
                    </a>
                  ),
                })),
              }}
            >
              <antd.Button 
                icon={<DownloadOutlined style={{ fontSize: '16px' }} />}
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
                Downloads
              </antd.Button>
            </antd.Dropdown>
          )}
        </antd.Space>
      ),
    },
  ];

  const handleCRApproval = (cr) => {
    // Update CR status
    const updatedCRs = changeRequests.map(item =>
      item.id === cr.id ? { ...item, status: 'approved' } : item
    );
    setChangeRequests(updatedCRs);

    // Notify parent component about new scope items from CR
    if (onCRChange) {
      const newScopeItems = cr.scopeItems.map(item => ({
        ...item,
        source: 'cr',
        crNumber: cr.crNumber,
        status: 'pending'
      }));
      onCRChange(newScopeItems);
    }

    antd.message.success(`CR ${cr.crNumber} approved and scope items added to project scope`);
  };

  const handlePOSubmit = (values) => {
    const newPO = {
      id: selectedItem?.id || Date.now(),
      poNumber: values.poNumber,
      description: values.description,
      amount: parseFloat(values.amount),
      dateReceived: values.dateReceived.toISOString(),
      status: 'approved', // Default to approved
    };

    if (selectedItem) {
      setPurchaseOrders(purchaseOrders.map(po =>
        po.id === selectedItem.id ? newPO : po
      ));
    } else {
      setPurchaseOrders([...purchaseOrders, newPO]);
    }
    if (onPOChange) onPOChange([...purchaseOrders, newPO]);
  };

  const handleCRSubmit = (values) => {
    const newCR = {
      id: selectedItem?.id || Date.now(),
      crNumber: values.crNumber || generateCRNumber(),
      description: values.description,
      relatedPO: values.relatedPO,
      amount: parseFloat(values.amount),
      dateReceived: values.dateReceived.toISOString(),
      status: 'approved', // Default to approved
    };

    if (selectedItem) {
      setChangeRequests(changeRequests.map(cr =>
        cr.id === selectedItem.id ? newCR : cr
      ));
    } else {
      setChangeRequests([...changeRequests, newCR]);
    }
    if (onCRChange) onCRChange([...changeRequests, newCR]);
  };

  return (
    <antd.Card style={{ width: '100%' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 16,
        width: '100%'
      }}>
        <Title level={4} style={{ margin: 0 }}>Purchase Orders & Change Requests</Title>
      </div>

      <antd.Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        style={{ width: '100%' }}
        items={[
          {
            key: 'po',
            label: 'Purchase Orders',
            children: (
              <>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                  <antd.Button
                    type="primary"
                    icon={<AddIcon style={{ fontSize: '16px' }} />}
                    onClick={() => {
                      setActiveTab('po');
                      setSelectedItem(null);
                      form.setFieldsValue({
                        type: 'po',
                        poNumber: generatePONumber(),
                        title: '',
                        description: '',
                        amount: '',
                        dateReceived: null,
                      });
                      setIsModalVisible(true);
                    }}
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
                    Add Purchase Order
                  </antd.Button>
                </div>
                <antd.Table
                  dataSource={purchaseOrders}
                  columns={poColumns}
                  rowKey="id"
                />
              </>
            )
          },
          {
            key: 'cr',
            label: 'Change Requests',
            children: (
              <>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                  <antd.Button
                    type="primary"
                    icon={<AddIcon style={{ fontSize: '16px' }} />}
                    onClick={() => {
                      setActiveTab('cr');
                      setSelectedItem(null);
                      form.setFieldsValue({
                        type: 'cr',
                        crNumber: generateCRNumber(),
                        title: '',
                        description: '',
                        amount: '',
                        relatedPO: undefined,
                        dateReceived: null,
                      });
                      setIsModalVisible(true);
                    }}
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
                    Add Change Request
                  </antd.Button>
                </div>
                <antd.Table
                  dataSource={changeRequests}
                  columns={crColumns}
                  rowKey="id"
                />
              </>
            )
          },
        ]}
      />

      <antd.Modal
        title={`Create ${activeTab === 'po' ? 'Purchase Order' : 'Change Request'}`}
        visible={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setSelectedItem(null);
          form.resetFields();
        }}
        footer={null}
        width={800}
      >
        <antd.Form
          form={form}
          layout="vertical"
          onFinish={(values) => {
            if (activeTab === 'po') {
              handlePOSubmit(values);
            } else {
              handleCRSubmit(values);
            }
            setIsModalVisible(false);
            form.resetFields();
          }}
        >
          {activeTab === 'po' ? (
            <>
              <antd.Form.Item
                name="poNumber"
                label="PO Number"
                rules={[{ required: true, message: 'Please enter PO number' }]}
              >
                <antd.Input />
              </antd.Form.Item>
              <antd.Form.Item
                name="dateReceived"
                label="Date Received"
                rules={[{ required: true, message: 'Please select date received' }]}
              >
                <antd.DatePicker style={{ width: '100%' }} />
              </antd.Form.Item>
              <antd.Form.Item
                name="description"
                label="Description"
                rules={[{ required: true, message: 'Please enter description' }]}
              >
                <TextArea rows={4} />
              </antd.Form.Item>
              <antd.Form.Item
                name="amount"
                label="Amount (SAR)"
                rules={[{ required: true, message: 'Please enter amount' }]}
              >
                <antd.InputNumber
                  style={{ width: '100%' }}
                  formatter={value => `SAR ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/SAR\s?|(,*)/g, '')}
                />
              </antd.Form.Item>
            </>
          ) : (
            <>
              <antd.Form.Item
                name="crNumber"
                label="CR Number"
                rules={[{ required: true, message: 'Please enter CR number' }]}
              >
                <antd.Input />
              </antd.Form.Item>
              <antd.Form.Item
                name="dateReceived"
                label="Date Received"
                rules={[{ required: true, message: 'Please select date received' }]}
              >
                <antd.DatePicker style={{ width: '100%' }} />
              </antd.Form.Item>
              <antd.Form.Item
                name="description"
                label="Description"
                rules={[{ required: true, message: 'Please enter description' }]}
              >
                <TextArea rows={4} />
              </antd.Form.Item>
              <antd.Form.Item
                name="relatedPO"
                label="Related Purchase Order"
                rules={[{ required: true, message: 'Please select related PO' }]}
              >
                <antd.Select>
                  {purchaseOrders.map(po => (
                    <Option key={po.id} value={po.poNumber}>{po.poNumber}</Option>
                  ))}
                </antd.Select>
              </antd.Form.Item>
              <antd.Form.Item
                name="amount"
                label="Amount (SAR)"
                rules={[{ required: true, message: 'Please enter amount' }]}
              >
                <antd.InputNumber
                  style={{ width: '100%' }}
                  formatter={value => `SAR ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/SAR\s?|(,*)/g, '')}
                />
              </antd.Form.Item>
            </>
          )}
          <antd.Form.Item>
            <antd.Space>
              <antd.Button type="primary" htmlType="submit">
                Create {activeTab === 'po' ? 'Purchase Order' : 'Change Request'}
              </antd.Button>
              <antd.Button onClick={() => {
                setIsModalVisible(false);
                setSelectedItem(null);
                form.resetFields();
              }}>
                Cancel
              </antd.Button>
            </antd.Space>
          </antd.Form.Item>
        </antd.Form>
      </antd.Modal>
    </antd.Card>
  );
};

export default ChangeRequestSection;

import React, { useState } from 'react';
import { Card, Table, Button, Modal, Form, Input, Select, Typography, Tag, Space, Progress, InputNumber, Switch, message } from 'antd';
import { DeleteOutlined, PlusOutlined, CaretRightOutlined, CaretDownOutlined, EditOutlined } from '@ant-design/icons';
import { Add } from '@mui/icons-material';
import DeleteIcon from '@mui/icons-material/Delete';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const ProjectScopeSection = ({ projectId, purchaseOrders = [], changeRequests = [], onScopeChange }) => {
  console.log('ProjectScopeSection props:', { projectId, purchaseOrders, changeRequests });
  
  const [scopeItems, setScopeItems] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [breakdownItems, setBreakdownItems] = useState([{ description: '', percentage: 0 }]);
  const [form] = Form.useForm();

  console.log('Current scopeItems:', scopeItems);

  const handleUpdateCompletion = (itemId, newPercentage) => {
    console.log('Updating completion for item:', itemId, 'to', newPercentage);
    const newScopeItems = scopeItems.map(item => {
      if (item.id === itemId) {
        return { ...item, completion: newPercentage };
      }
      return item;
    });
    setScopeItems(newScopeItems);
    if (onScopeChange) onScopeChange(newScopeItems);
  };

  const handleUpdateBreakdownCompletion = (itemId, breakdownIndex, newPercentage) => {
    console.log('Updating breakdown completion for item:', itemId, 'at index', breakdownIndex, 'to', newPercentage);
    const newScopeItems = scopeItems.map(item => {
      if (item.id === itemId) {
        const newBreakdown = [...item.breakdown];
        newBreakdown[breakdownIndex] = {
          ...newBreakdown[breakdownIndex],
          percentage: newPercentage
        };
        const avgPercentage = Math.round(
          newBreakdown.reduce((sum, b) => sum + (b.percentage || 0), 0) / newBreakdown.length
        );
        return {
          ...item,
          breakdown: newBreakdown,
          completion: avgPercentage
        };
      }
      return item;
    });
    setScopeItems(newScopeItems);
    if (onScopeChange) onScopeChange(newScopeItems);
  };

  const handleAddScopeItem = (values) => {
    const newItem = {
      id: editingItem?.id || `scope-${Date.now()}`,
      title: values.title,
      description: values.description,
      completion: values.completion || 0,
      linkedPO: values.linkedPO,
      linkedCR: values.linkedCR,
      breakdown: values.hasBreakdown ? breakdownItems.filter(item => item.description.trim()) : []
    };

    const newScopeItems = editingItem ? scopeItems.map(item => item.id === editingItem.id ? newItem : item) : [...scopeItems, newItem];
    setScopeItems(newScopeItems);
    if (onScopeChange) onScopeChange(newScopeItems);
    setIsModalVisible(false);
    setEditingItem(null);
    setBreakdownItems([{ description: '', percentage: 0 }]);
    form.resetFields();
  };

  const handleDeleteScopeItem = (itemId) => {
    const newScopeItems = scopeItems.filter(item => item.id !== itemId);
    setScopeItems(newScopeItems);
    if (onScopeChange) onScopeChange(newScopeItems);
    message.success('Scope item deleted');
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      width: '20%',
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {record.breakdown?.length > 0 && (
            <CaretRightOutlined style={{ fontSize: '12px', color: '#999' }} />
          )}
          {text}
        </div>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: '30%',
    },
    {
      title: 'Progress',
      key: 'completion',
      width: '20%',
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Progress percent={record.completion} size="small" style={{ flex: 1 }} />
          {!record.breakdown?.length && (
            <InputNumber
              min={0}
              max={100}
              value={record.completion}
              onChange={(value) => handleUpdateCompletion(record.id, value)}
              style={{ width: 70 }}
            />
          )}
          <span>%</span>
        </div>
      ),
    },
    {
      title: 'Linked PO/CR',
      dataIndex: 'linkedItems',
      key: 'linkedItems',
      width: '15%',
      render: (_, record) => {
        const items = [];
        
        // Add PO links
        if (record.linkedPO && Array.isArray(record.linkedPO)) {
          record.linkedPO.forEach(poId => {
            const po = purchaseOrders.find(p => p.id === poId);
            if (po) {
              items.push(<Tag key={`po-${poId}`} color="blue">PO: {po.poNumber}</Tag>);
            }
          });
        }
        
        // Add CR links
        if (record.linkedCR && Array.isArray(record.linkedCR)) {
          record.linkedCR.forEach(crId => {
            const cr = changeRequests.find(c => c.id === crId);
            if (cr) {
              items.push(<Tag key={`cr-${crId}`} color="purple">CR: {cr.crNumber}</Tag>);
            }
          });
        }
        
        return items.length > 0 ? <Space>{items}</Space> : '-';
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small" style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            icon={<EditOutlined style={{ fontSize: '16px' }} />}
            onClick={() => {
              setEditingItem(record);
              setIsModalVisible(true);
              form.setFieldsValue({
                ...record,
                linkedItems: record.linkedItems || []
              });
              setBreakdownItems(record.breakdown || [{ description: '', percentage: 0 }]);
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
          <Button
            type="primary"
            danger
            icon={<DeleteIcon style={{ fontSize: '16px' }} />}
            onClick={() => handleDeleteScopeItem(record.id)}
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
      width: '120px'
    },
  ];

  const addBreakdownItem = () => {
    console.log('Adding new breakdown item');
    setBreakdownItems([...breakdownItems, { description: '', percentage: 0 }]);
  };

  const updateBreakdownItem = (index, field, value) => {
    console.log('Updating breakdown item at index', index, 'with', field, '=', value);
    const newBreakdownItems = [...breakdownItems];
    newBreakdownItems[index][field] = value;
    setBreakdownItems(newBreakdownItems);
  };

  const removeBreakdownItem = (index) => {
    console.log('Removing breakdown item at index', index);
    const newBreakdownItems = breakdownItems.filter((_, i) => i !== index);
    setBreakdownItems(newBreakdownItems);
  };

  const handleSubmit = (values) => {
    console.log('Submitting form with values:', values);
    
    let validBreakdown = [];
    let completion = values.completion || 0;

    if (values.hasBreakdown && breakdownItems.length > 0) {
      validBreakdown = breakdownItems
        .filter(item => item.description.trim()) // Only filter empty descriptions
        .map(item => ({
          description: item.description,
          percentage: Number(item.percentage || 0) // Default to 0 if not set
        }));

      // Calculate completion as average of breakdown items
      if (validBreakdown.length > 0) {
        completion = Math.round(validBreakdown.reduce((acc, item) => acc + item.percentage, 0) / validBreakdown.length);
      }
    }

    handleAddScopeItem({ ...values, completion, breakdown: validBreakdown });
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingItem(null);
    setBreakdownItems([{ description: '', percentage: 0 }]);
    form.resetFields();
  };

  return (
    <Card title="Project Scope">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setIsModalVisible(true);
            form.resetFields();
            setEditingItem(null);
            setBreakdownItems([{ description: '', percentage: 0 }]);
          }}
          style={{ 
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            height: '32px'
          }}
        >
          Add Scope Item
        </Button>
      </div>

      <Table
        dataSource={scopeItems}
        columns={columns}
        expandable={{
          expandedRowRender: record => (
            record.breakdown && record.breakdown.length > 0 ? (
              <Table
                dataSource={record.breakdown}
                pagination={false}
                showHeader={false}
                columns={[
                  {
                    dataIndex: 'description',
                    width: '50%',
                  },
                  {
                    key: 'percentage',
                    width: '50%',
                    render: (_, item, index) => (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Progress percent={item.percentage} size="small" style={{ flex: 1 }} />
                        <InputNumber
                          min={0}
                          max={100}
                          value={item.percentage}
                          onChange={(value) => handleUpdateBreakdownCompletion(record.id, index, value)}
                          style={{ width: 70 }}
                        />
                        <span>%</span>
                      </div>
                    ),
                  },
                ]}
              />
            ) : null
          ),
          rowExpandable: record => record.breakdown && record.breakdown.length > 0,
        }}
      />

      <Modal
        title={editingItem ? "Edit Scope Item" : "Add Scope Item"}
        open={isModalVisible}
        onOk={() => form.submit()}
        onCancel={handleCancel}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            hasBreakdown: false,
            completion: 0,
          }}
        >
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: 'Please enter a title' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter a description' }]}
          >
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item
            name="hasBreakdown"
            valuePropName="checked"
          >
            <Switch checkedChildren="Has Breakdown" unCheckedChildren="No Breakdown" />
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => prevValues.hasBreakdown !== currentValues.hasBreakdown}
          >
            {({ getFieldValue }) => {
              const hasBreakdown = getFieldValue('hasBreakdown');
              
              return hasBreakdown ? (
                <div>
                  <Title level={5}>Breakdown Items</Title>
                  {breakdownItems.map((item, index) => (
                    <div key={index} style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                      <Form.Item
                        style={{ flex: 1, marginBottom: 0 }}
                      >
                        <Input
                          placeholder="Breakdown description"
                          value={item.description}
                          onChange={(e) => updateBreakdownItem(index, 'description', e.target.value)}
                        />
                      </Form.Item>
                      <Form.Item style={{ width: 120, marginBottom: 0 }}>
                        <InputNumber
                          min={0}
                          max={100}
                          value={item.percentage}
                          onChange={(value) => updateBreakdownItem(index, 'percentage', value)}
                          addonAfter="%"
                          style={{ width: '100%' }}
                        />
                      </Form.Item>
                      <Button
                        type="primary"
                        danger
                        icon={<DeleteOutlined />}
                        size="middle"
                        onClick={() => removeBreakdownItem(index)}
                        disabled={breakdownItems.length === 1}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      />
                    </div>
                  ))}
                  <Button
                    type="dashed"
                    onClick={addBreakdownItem}
                    block
                    icon={<PlusOutlined />}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, height: '40px' }}
                  >
                    Add Breakdown Item
                  </Button>
                </div>
              ) : (
                <Form.Item
                  name="completion"
                  label="Completion Percentage"
                >
                  <InputNumber
                    min={0}
                    max={100}
                    formatter={value => `${value}%`}
                    parser={value => value.replace('%', '')}
                    style={{ width: 120 }}
                  />
                </Form.Item>
              );
            }}
          </Form.Item>

          <Form.Item
            name="linkedPO"
            label="Linked Purchase Orders"
          >
            <Select mode="multiple">
              {purchaseOrders.map(po => (
                <Option key={po.id} value={po.id}>{po.poNumber}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="linkedCR"
            label="Linked Change Requests"
          >
            <Select mode="multiple">
              {changeRequests.map(cr => (
                <Option key={cr.id} value={cr.id}>{cr.crNumber}</Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default ProjectScopeSection;

import React, { useState, useEffect } from 'react'
import {
  Flex,
  View,
  Heading,
  Text,
  TextField,
  Picker,
  Item,
  Button,
  ProgressCircle,
  Divider,
  Well,
  Dialog,
  DialogTrigger,
  DialogContainer,
  Content,
  ActionButton,
  ButtonGroup,
  Checkbox,
  AlertDialog
} from '@adobe/react-spectrum'
import Search from '@spectrum-icons/workflow/Search'
import Globe from '@spectrum-icons/workflow/Globe'
import Article from '@spectrum-icons/workflow/Article'
import UserGroup from '@spectrum-icons/workflow/UserGroup'
import Star from '@spectrum-icons/workflow/Star'
import Close from '@spectrum-icons/workflow/Close'
import Edit from '@spectrum-icons/workflow/Edit'
import { API_BASE_URL } from './services/api'

// Styles for HTML content rendering
const contentStyles = `
  .rewritten-content h2 {
    font-size: 20px;
    font-weight: 600;
    color: #1a1a1a;
    margin: 16px 0 10px 0;
    border-bottom: 2px solid #28a745;
    padding-bottom: 6px;
  }
  .rewritten-content h3 {
    font-size: 17px;
    font-weight: 600;
    color: #333;
    margin: 14px 0 8px 0;
  }
  .rewritten-content p {
    margin: 10px 0;
    text-align: justify;
  }
  .rewritten-content ul, .rewritten-content ol {
    margin: 10px 0;
    padding-left: 24px;
  }
  .rewritten-content li {
    margin: 6px 0;
  }
  .rewritten-content strong {
    color: #28a745;
    font-weight: 600;
  }
`

function App() {
  const [products, setProducts] = useState(['Forms', 'Assets', 'Sites'])
  const [selectedProduct, setSelectedProduct] = useState(null) // null = show placeholder
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)
  const [selectedTimeRange, setSelectedTimeRange] = useState('month')
  
  // State for keyword selection and content rewriting
  const [selectedKeywords, setSelectedKeywords] = useState([])
  const [rewriteLoading, setRewriteLoading] = useState(false)
  const [rewrittenContent, setRewrittenContent] = useState(null)
  const [showLimitDialog, setShowLimitDialog] = useState(false)
  const MAX_KEYWORDS = 3

  // Fetch products from backend on load
  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products`)
      const data = await response.json()
      if (data.status === 'success' && data.products && data.products.length > 0) {
        setProducts(data.products)
        // Don't auto-select first product - keep placeholder
      }
    } catch (err) {
      console.error('Failed to fetch products from backend:', err)
    }
  }

  const analyzeUrl = async () => {
    if (!selectedProduct) {
      setError('Please select a product type')
      return
    }

    if (!url.trim()) {
      setError('Please enter a URL')
      return
    }

    setLoading(true)
    setError(null)
    setResults(null)
    setSelectedKeywords([]) // Reset selected keywords
    setRewrittenContent(null) // Reset rewritten content

    try {
      const response = await fetch(`${API_BASE_URL}/api/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: url,
          product: selectedProduct,
          time_range: selectedTimeRange
        })
      })

      const data = await response.json()

      if (data.status === 'success') {
        setResults(data.data)
      } else {
        setError(data.detail || 'Analysis failed')
      }
    } catch (err) {
      setError(`Failed to connect to backend: ${err.message}. Make sure backend is running at ${API_BASE_URL}`)
    } finally {
      setLoading(false)
    }
  }

  // Handle keyword selection (max 3)
  const handleKeywordSelect = (keyword, isSelected) => {
    if (isSelected) {
      if (selectedKeywords.length < MAX_KEYWORDS) {
        setSelectedKeywords([...selectedKeywords, keyword])
      } else {
        // Show dialog when user tries to select more than 3
        setShowLimitDialog(true)
      }
    } else {
      setSelectedKeywords(selectedKeywords.filter(k => k !== keyword))
    }
  }

  // Check if keyword is selected
  const isKeywordSelected = (keyword) => {
    return selectedKeywords.includes(keyword)
  }

  // Check if selection limit reached (for disabling checkboxes)
  const isSelectionLimitReached = () => {
    return selectedKeywords.length >= MAX_KEYWORDS
  }

  // Rewrite content with selected keywords
  const rewriteContent = async () => {
    // Prevent double-click
    if (rewriteLoading) {
      return
    }
    
    if (selectedKeywords.length === 0) {
      setError('Please select at least one keyword')
      return
    }

    if (!results?.original_content) {
      setError('No content available to rewrite')
      return
    }

    // Set loading state immediately
    setRewriteLoading(true)
    setError(null)
    setRewrittenContent(null) // Clear previous result

    try {
      console.log('[Frontend] Rewriting content with keywords:', selectedKeywords)
      
      const response = await fetch(`${API_BASE_URL}/api/rewrite-content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: results.original_content,
          target_keywords: selectedKeywords,
          tone: 'professional'
        })
      })

      const data = await response.json()
      console.log('[Frontend] Rewrite response:', data)

      if (data.status === 'success') {
        setRewrittenContent(data.data)
      } else {
        setError(data.detail || 'Content rewriting failed')
      }
    } catch (err) {
      console.error('[Frontend] Rewrite error:', err)
      setError(`Failed to rewrite content: ${err.message}`)
    } finally {
      setRewriteLoading(false)
    }
  }

  const formatVolume = (volume) => {
    if (volume === null || volume === undefined) return '-'
    return volume.toLocaleString()
  }

  const formatCPC = (cpc) => {
    if (cpc === null || cpc === undefined) return '-'
    return `$${Number(cpc).toFixed(2)}`
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'low': return '#28a745'
      case 'medium': return '#ffc107'
      case 'high': return '#dc3545'
      default: return '#6c757d'
    }
  }

  const getDifficultyBadge = (difficulty) => {
    const color = getDifficultyColor(difficulty)
    return (
      <span style={{
        backgroundColor: color,
        color: difficulty?.toLowerCase() === 'medium' ? '#333' : 'white',
        padding: '3px 10px',
        borderRadius: '12px',
        fontSize: '11px',
        fontWeight: 'bold',
        textTransform: 'uppercase'
      }}>
        {difficulty || 'N/A'}
      </span>
    )
  }

  // Keyword Details Popup Component - Compact version with Close button
  const KeywordDetailsPopup = ({ keyword, close }) => (
    <Dialog size="S" isDismissable>
      <Heading UNSAFE_style={{ fontSize: '16px' }}>
        <Flex justifyContent="space-between" alignItems="center">
          <Text>Keyword Details</Text>
        </Flex>
      </Heading>
      <Divider />
      <Content UNSAFE_style={{ padding: '12px' }}>
        <Flex direction="column" gap="size-150">
          {/* Keyword Name */}
          <View 
            backgroundColor="blue-100" 
            padding="size-150" 
            borderRadius="small"
            UNSAFE_style={{ textAlign: 'center' }}
          >
            <Text UNSAFE_style={{ fontWeight: 700, fontSize: '15px', color: '#0d6efd' }}>
              {keyword.keyword}
            </Text>
          </View>

          {/* Details - Compact Grid */}
          <View backgroundColor="gray-75" padding="size-150" borderRadius="small">
            <Flex direction="column" gap="size-100">
              {/* Search Volume */}
              <Flex justifyContent="space-between" alignItems="center">
                <Text UNSAFE_style={{ fontSize: '13px', color: '#555' }}>Volume:</Text>
                <Text UNSAFE_style={{ fontWeight: 700, fontSize: '13px' }}>
                  {formatVolume(keyword.search_volume)}
                </Text>
              </Flex>

              {/* CPC */}
              <Flex justifyContent="space-between" alignItems="center">
                <Text UNSAFE_style={{ fontSize: '13px', color: '#555' }}>CPC:</Text>
                <Text UNSAFE_style={{ fontWeight: 700, fontSize: '13px', color: '#28a745' }}>
                  {formatCPC(keyword.cpc)}
                </Text>
              </Flex>

              {/* Difficulty */}
              <Flex justifyContent="space-between" alignItems="center">
                <Text UNSAFE_style={{ fontSize: '13px', color: '#555' }}>Difficulty:</Text>
                {getDifficultyBadge(keyword.difficulty)}
              </Flex>

              {/* Competitors (if available) */}
              {keyword.used_by && keyword.used_by.length > 0 && (
                <Flex direction="column" gap="size-50">
                  <Text UNSAFE_style={{ fontSize: '13px', color: '#555' }}>
                    Competitors:
                  </Text>
                  <Flex gap="size-50" wrap>
                    {keyword.used_by.map((comp, idx) => (
                      <span
                        key={idx}
                        style={{
                          backgroundColor: '#e9ecef',
                          padding: '2px 8px',
                          borderRadius: '10px',
                          fontSize: '11px',
                          color: '#495057'
                        }}
                      >
                        {comp}
                      </span>
                    ))}
                  </Flex>
                </Flex>
              )}
            </Flex>
          </View>

          {/* SEMrush Link */}
          {keyword.semrush_url && (
            <ActionButton
              onPress={() => window.open(keyword.semrush_url, '_blank')}
              UNSAFE_style={{ fontSize: '12px' }}
            >
              <Text>View in SEMrush →</Text>
            </ActionButton>
          )}
        </Flex>
      </Content>
      <ButtonGroup>
        <Button variant="secondary" onPress={close}>
          <Close size="XS" />
          <Text>Close</Text>
        </Button>
      </ButtonGroup>
    </Dialog>
  )

  // Keyword Card Component - Bigger fonts, less white space
  const KeywordCard = ({ keyword }) => (
    <View
      backgroundColor="gray-50"
      borderRadius="small"
      borderWidth="thin"
      borderColor="gray-300"
      UNSAFE_style={{ padding: '10px 14px' }}
    >
      {/* Row 1: Keyword, Volume, Dropdown */}
      <Flex alignItems="center" justifyContent="space-between" gap="size-100">
        <Text UNSAFE_style={{ fontWeight: 600, fontSize: '15px', flex: 1 }}>
          {keyword.keyword}
        </Text>
        <Text UNSAFE_style={{ fontSize: '14px', color: '#333', minWidth: '55px', textAlign: 'right' }}>
          <strong>{formatVolume(keyword.search_volume)}</strong>
        </Text>
        <Picker
          selectedKey={selectedTimeRange}
          onSelectionChange={setSelectedTimeRange}
          width="size-1200"
          aria-label="Volume Time Range"
          isQuiet
        >
          <Item key="week">Weekly</Item>
          <Item key="month">Monthly</Item>
          <Item key="year">Yearly</Item>
        </Picker>
      </Flex>
      {/* Row 2: See More aligned right */}
      <div style={{ textAlign: 'right', marginTop: '4px' }}>
        <DialogTrigger type="modal">
          <ActionButton isQuiet UNSAFE_style={{ color: '#0d6efd', fontSize: '13px', textDecoration: 'underline', padding: '0', minHeight: '20px' }}>
            <Text>See More</Text>
          </ActionButton>
          {(close) => <KeywordDetailsPopup keyword={keyword} close={close} />}
        </DialogTrigger>
      </div>
    </View>
  )

  // Keyword Column Component - Full width, bigger fonts
  const KeywordColumn = ({ title, icon, keywords, color }) => (
    <View
      backgroundColor="gray-100"
      borderRadius="medium"
      UNSAFE_style={{ 
        flex: '1',
        minWidth: '300px',
        padding: '16px'
      }}
    >
      <Flex direction="column" gap="size-150">
        {/* Header */}
        <Flex alignItems="center" gap="size-100">
          <View
            backgroundColor={color}
            UNSAFE_style={{ padding: '6px' }}
            borderRadius="small"
          >
            {icon}
          </View>
          <Heading level={4} UNSAFE_style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>
            {title}
          </Heading>
          <Text UNSAFE_style={{ color: '#6e6e6e', fontSize: '14px' }}>
            ({keywords?.length || 0})
          </Text>
        </Flex>

        {/* Keywords List */}
        <Flex direction="column" gap="size-100">
          {keywords?.map((kw, idx) => (
            <KeywordCard
              key={idx}
              keyword={kw}
            />
          ))}
          {(!keywords || keywords.length === 0) && (
            <Text UNSAFE_style={{ color: '#9e9e9e', fontStyle: 'italic', fontSize: '14px' }}>
              No keywords found
            </Text>
          )}
        </Flex>
      </Flex>
    </View>
  )

  // Competitor Keywords Column - Grouped by Article Keyword
  const CompetitorKeywordsColumn = ({ mappings, competitorKeywords }) => {
    // Get all competitor keywords count
    const totalCount = competitorKeywords?.length || 0
    
    return (
      <View
        backgroundColor="gray-100"
        borderRadius="medium"
        UNSAFE_style={{ 
          flex: '1',
          minWidth: '300px',
          padding: '16px'
        }}
      >
        <Flex direction="column" gap="size-150">
          {/* Header */}
          <Flex alignItems="center" gap="size-100">
            <View
              backgroundColor="orange-500"
              UNSAFE_style={{ padding: '6px' }}
              borderRadius="small"
            >
              <UserGroup size="S" UNSAFE_style={{ color: 'white' }} />
            </View>
            <Heading level={4} UNSAFE_style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>
              Competitor Keywords
            </Heading>
            <Text UNSAFE_style={{ color: '#6e6e6e', fontSize: '14px' }}>
              ({totalCount})
            </Text>
          </Flex>

          {/* Grouped by Article Keyword */}
          <Flex direction="column" gap="size-200">
            {mappings?.map((mapping, idx) => (
              <View 
                key={idx}
                backgroundColor="white"
                borderRadius="small"
                UNSAFE_style={{ padding: '12px', border: '1px solid #ddd' }}
              >
                {/* Article Keyword Header */}
                <Text UNSAFE_style={{ 
                  fontSize: '12px', 
                  color: '#666', 
                  marginBottom: '8px',
                  fontWeight: 500
                }}>
                  For: <span style={{ color: '#0d6efd', fontWeight: 600 }}>{mapping.article_keyword?.keyword}</span>
                </Text>
                
                {/* All Competitor Keywords for this Article Keyword */}
                <Flex direction="column" gap="size-100">
                  {mapping.competitor_keywords?.map((ckw, cidx) => (
                    <View
                      key={cidx}
                      backgroundColor="gray-50"
                      borderRadius="small"
                      borderWidth="thin"
                      borderColor="gray-300"
                      UNSAFE_style={{ padding: '8px 12px' }}
                    >
                      {/* Row 1: Keyword, Volume, See More */}
                      <Flex alignItems="center" justifyContent="space-between" gap="size-100">
                        <Text UNSAFE_style={{ fontWeight: 600, fontSize: '14px', flex: 1 }}>
                          {ckw.keyword}
                        </Text>
                        <Text UNSAFE_style={{ fontSize: '13px', color: '#333', minWidth: '50px', textAlign: 'right' }}>
                          <strong>{formatVolume(ckw.search_volume)}</strong>
                        </Text>
                      </Flex>
                      {/* Row 2: See More aligned right */}
                      <div style={{ textAlign: 'right', marginTop: '4px' }}>
                        <DialogTrigger type="modal">
                          <ActionButton isQuiet UNSAFE_style={{ 
                            color: '#0d6efd', 
                            fontSize: '12px', 
                            textDecoration: 'underline', 
                            padding: '0', 
                            minHeight: '18px' 
                          }}>
                            <Text>See More</Text>
                          </ActionButton>
                          {(close) => (
                            <KeywordDetailsPopup 
                              keyword={{
                                keyword: ckw.keyword,
                                search_volume: ckw.search_volume,
                                cpc: ckw.cpc,
                                difficulty: ckw.difficulty,
                                used_by: [ckw.competitor],
                                source: 'Competitor Analysis',
                                semrush_url: `https://www.semrush.com/analytics/keywordoverview/?q=${encodeURIComponent(ckw.keyword)}`
                              }} 
                              close={close} 
                            />
                          )}
                        </DialogTrigger>
                      </div>
                    </View>
                  ))}
                </Flex>
              </View>
            ))}
            
            {(!mappings || mappings.length === 0) && (
              <Text UNSAFE_style={{ color: '#9e9e9e', fontStyle: 'italic', fontSize: '14px' }}>
                No competitor keywords found
              </Text>
            )}
          </Flex>
        </Flex>
      </View>
    )
  }

  // Suggested Keyword Card with Selection Checkbox
  const SuggestedKeywordCard = ({ keyword }) => {
    const isSelected = isKeywordSelected(keyword.keyword)
    // Disable checkbox if not selected and limit is reached
    const isDisabled = !isSelected && isSelectionLimitReached()

  return (
      <View
        backgroundColor={isSelected ? "green-100" : "gray-50"}
        borderRadius="small"
        borderWidth="thin"
        borderColor={isSelected ? "green-500" : "gray-300"}
        UNSAFE_style={{ padding: '10px 14px', opacity: isDisabled ? 0.6 : 1 }}
      >
        {/* Row 1: Checkbox, Keyword, Volume, Dropdown */}
        <Flex alignItems="center" justifyContent="space-between" gap="size-100">
          <Checkbox
            isSelected={isSelected}
            isDisabled={isDisabled}
            onChange={(checked) => handleKeywordSelect(keyword.keyword, checked)}
            aria-label={`Select ${keyword.keyword}`}
          />
          <Text UNSAFE_style={{ fontWeight: 600, fontSize: '15px', flex: 1 }}>
            {keyword.keyword}
          </Text>
          <Text UNSAFE_style={{ fontSize: '14px', color: '#333', minWidth: '55px', textAlign: 'right' }}>
            <strong>{formatVolume(keyword.search_volume)}</strong>
          </Text>
          <Picker
            selectedKey={selectedTimeRange}
            onSelectionChange={setSelectedTimeRange}
            width="size-1200"
            aria-label="Volume Time Range"
            isQuiet
          >
            <Item key="week">Weekly</Item>
            <Item key="month">Monthly</Item>
            <Item key="year">Yearly</Item>
          </Picker>
        </Flex>
        {/* Row 2: See More aligned right */}
        <div style={{ textAlign: 'right', marginTop: '4px' }}>
          <DialogTrigger type="modal">
            <ActionButton isQuiet UNSAFE_style={{ color: '#0d6efd', fontSize: '13px', textDecoration: 'underline', padding: '0', minHeight: '20px' }}>
              <Text>See More</Text>
            </ActionButton>
            {(close) => <KeywordDetailsPopup keyword={keyword} close={close} />}
          </DialogTrigger>
        </div>
      </View>
    )
  }

  // Keyword Limit Exceeded Dialog
  const KeywordLimitDialog = () => (
    <Dialog size="S" isDismissable onDismiss={() => setShowLimitDialog(false)}>
      <Heading UNSAFE_style={{ fontSize: '16px' }}>
        Selection Limit Reached
      </Heading>
      <Divider />
      <Content UNSAFE_style={{ padding: '16px' }}>
        <Text UNSAFE_style={{ fontSize: '14px' }}>
          You can only select up to <strong>{MAX_KEYWORDS} keywords</strong> for content rewriting. 
          Please deselect a keyword before selecting a new one.
        </Text>
      </Content>
      <ButtonGroup>
        <Button variant="cta" onPress={() => setShowLimitDialog(false)}>
          <Close size="XS" />
          <Text>Close</Text>
        </Button>
      </ButtonGroup>
    </Dialog>
  )

  // Suggested Keywords Column with Selection
  const SuggestedKeywordsColumn = ({ keywords }) => (
    <View
      backgroundColor="gray-100"
      borderRadius="medium"
      UNSAFE_style={{ 
        flex: '1',
        minWidth: '300px',
        padding: '16px'
      }}
    >
      <Flex direction="column" gap="size-150">
      {/* Header */}
        <Flex alignItems="center" gap="size-100">
          <View
            backgroundColor="green-500"
            UNSAFE_style={{ padding: '6px' }}
            borderRadius="small"
          >
            <Star size="S" UNSAFE_style={{ color: 'white' }} />
          </View>
          <Heading level={4} UNSAFE_style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>
            Suggested Keywords
          </Heading>
          <Text UNSAFE_style={{ color: '#6e6e6e', fontSize: '14px' }}>
            ({keywords?.length || 0})
          </Text>
        </Flex>

        {/* Keywords List with Checkboxes */}
        <Flex direction="column" gap="size-100">
          {keywords?.map((kw, idx) => (
            <SuggestedKeywordCard
              key={idx}
              keyword={kw}
            />
          ))}
          {(!keywords || keywords.length === 0) && (
            <Text UNSAFE_style={{ color: '#9e9e9e', fontStyle: 'italic', fontSize: '14px' }}>
              No keywords found
            </Text>
          )}
        </Flex>

        {/* Rewrite Button */}
        {selectedKeywords.length > 0 && (
          <Button 
            variant="cta" 
            onPress={() => !rewriteLoading && rewriteContent()}
            isDisabled={rewriteLoading}
            UNSAFE_style={{ marginTop: '8px', cursor: rewriteLoading ? 'not-allowed' : 'pointer' }}
          >
            <Flex alignItems="center" gap="size-100">
              {rewriteLoading ? (
                <ProgressCircle size="S" isIndeterminate aria-label="Rewriting" />
              ) : (
                <Edit size="S" />
              )}
              <Text>{rewriteLoading ? 'Rewriting...' : `Rewrite Content (${selectedKeywords.length} keywords)`}</Text>
            </Flex>
          </Button>
        )}
      </Flex>
    </View>
  )

  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#f5f5f5', 
      minHeight: '100vh',
      boxSizing: 'border-box'
    }}>
      {/* Inject styles for HTML content */}
      <style>{contentStyles}</style>
      
      {/* Header */}
      <Heading level={1} UNSAFE_style={{ margin: '0 0 16px 0', fontSize: '28px', fontWeight: 700 }}>
        Competitive Vocabulary Intelligence Agent
      </Heading>

      {/* Input Section - Prominent Card */}
      <View 
        backgroundColor="white" 
        borderRadius="medium"
        marginBottom="size-300"
        UNSAFE_style={{ 
          padding: '24px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
          border: '1px solid #e0e0e0'
        }}
      >
        <Flex direction="column" gap="size-250">
          <Heading level={2} UNSAFE_style={{ margin: 0, fontSize: '26px', fontWeight: 700 }}>
            Analyze URL
          </Heading>
          
          <Flex gap="size-300" wrap alignItems="end">
            {/* Product Picker with placeholder */}
            <Picker
              label={<span style={{ fontSize: '17px', fontWeight: 600 }}>Product Type</span>}
              placeholder="Select Product Type"
              selectedKey={selectedProduct}
              onSelectionChange={selected => setSelectedProduct(selected)}
              width="size-2400"
            >
              {products.map(product => (
                <Item key={product}>{product}</Item>
              ))}
            </Picker>

            {/* URL Input */}
            <TextField
              label={<span style={{ fontSize: '17px', fontWeight: 600 }}>Enter URL</span>}
              placeholder="https://experienceleague.adobe.com/.../content/forms/..."
              value={url}
              onChange={setUrl}
              width="size-5000"
              icon={<Globe />}
            />

            {/* Analyze Button */}
            <Button 
              variant="cta" 
              onPress={analyzeUrl}
              isDisabled={loading}
              UNSAFE_style={{ height: '40px', fontSize: '16px', padding: '0 20px' }}
            >
              <Flex alignItems="center" gap="size-100">
                {loading ? (
                  <ProgressCircle size="S" isIndeterminate aria-label="Loading" />
                ) : (
                  <Search />
                )}
                <Text>{loading ? 'Analyzing...' : 'Analyze'}</Text>
              </Flex>
            </Button>
          </Flex>
        </Flex>
      </View>

      {/* Error Display */}
      {error && (
        <Well role="alert" marginBottom="size-300">
          <Text UNSAFE_style={{ color: '#d7373f' }}>Warning: {error}</Text>
        </Well>
      )}

      {/* Results Section */}
      {results && (
        <>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '20px' }}>
            {/* Article Keywords Column */}
            <KeywordColumn
              title="Article Keywords"
              icon={<Article size="S" UNSAFE_style={{ color: 'white' }} />}
              keywords={results.article_keywords}
              color="blue-500"
            />

            {/* Competitor Keywords Column - Grouped by Article Keyword */}
            <CompetitorKeywordsColumn
              mappings={results.keyword_mappings}
              competitorKeywords={results.competitor_keywords}
            />

            {/* Suggested Keywords Column with Selection - Only Highest Volume */}
            <SuggestedKeywordsColumn keywords={results.suggested_keywords} />
          </div>

          {/* Rewritten Content Section */}
          {rewrittenContent && (
          <View 
              backgroundColor="white" 
            borderRadius="medium"
              UNSAFE_style={{ 
                padding: '24px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                border: '1px solid #28a745'
              }}
          >
            <Flex direction="column" gap="size-200">
                <Flex alignItems="center" gap="size-100">
          <View 
                    backgroundColor="green-500"
                    UNSAFE_style={{ padding: '6px' }}
                    borderRadius="small"
                  >
                    <Edit size="S" UNSAFE_style={{ color: 'white' }} />
                  </View>
                  <Heading level={3} UNSAFE_style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>
                    SEO Optimized Content
                  </Heading>
                </Flex>

                {/* Selected Keywords */}
                <View backgroundColor="green-100" padding="size-150" borderRadius="small">
                    <Flex direction="column" gap="size-100">
                    <Text UNSAFE_style={{ fontSize: '14px', fontWeight: 600, color: '#28a745' }}>
                      Selected Keywords:
                      </Text>
                    <Flex gap="size-100" wrap>
                      {rewrittenContent.target_keywords?.map((kw, idx) => (
                        <span
                          key={idx}
                          style={{
                            backgroundColor: '#28a745',
                            color: 'white',
                            padding: '4px 12px',
                            borderRadius: '15px',
                            fontSize: '13px',
                            fontWeight: 500
                          }}
                        >
                          {kw}
                        </span>
                      ))}
                    </Flex>
            </Flex>
          </View>

                <Divider />

                {/* Rewritten Content - Renders HTML */}
                <View 
                  backgroundColor="gray-50" 
                  padding="size-200" 
                  borderRadius="small"
                  UNSAFE_style={{ maxHeight: '500px', overflow: 'auto' }}
                >
                  <div 
                    className="rewritten-content"
                    style={{ 
                      fontSize: '14px', 
                      lineHeight: '1.7',
                      color: '#333'
                    }}
                    dangerouslySetInnerHTML={{ __html: rewrittenContent.rewritten_content }}
                  />
                </View>

                {/* Copy Button */}
                <Button 
                  variant="secondary" 
                  onPress={() => {
                    navigator.clipboard.writeText(rewrittenContent.rewritten_content)
                    alert('Content copied to clipboard!')
                  }}
                >
                  <Text>Copy Rewritten Content</Text>
                </Button>
            </Flex>
          </View>
          )}
        </>
      )}

      {/* Keyword Limit Dialog */}
      <DialogContainer onDismiss={() => setShowLimitDialog(false)}>
        {showLimitDialog && <KeywordLimitDialog />}
      </DialogContainer>

    </div>
  )
}

export default App

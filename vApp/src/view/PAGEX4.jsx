import {
    Layout,

    Alert, Flex, Card,

} from 'antd'

import  {useEffect, useState} from 'react'

const {Content, Footer, Sider} = Layout

import Marquee from 'react-fast-marquee'


const StaticHTML = () => {
    const [showHighlight, setShowHighlight] = useState(false)
    useEffect(() => {
        setShowHighlight(!showHighlight)
    }, [showHighlight])

    return (
        <>
            <Layout className={'mainLayout'}>
                <Content className="mainContent">

                    <Alert className='contentHeader'
                           banner
                           message={
                               <Marquee pauseOnHover speed={40} gradient={false} gradientColor={'#444'}>
                                   <p>Loading IP= ...(BOX狀態燈需為綠色；紅色鑒察IP與是否開機)</p>
                               </Marquee>
                           }
                    />
                    <Flex gap="middle" align="center" justify="center" vertical>
                        <Card className="cardContent" title={`saco-Measure`}
                              bordered={true}>
                           <>AAA</>
                        </Card>
                        <Footer className="contentFooter">
                            saco-Measure | 2025
                        </Footer>
                    </Flex>
                </Content>
            </Layout>
        </>
    )
}
export default StaticHTML


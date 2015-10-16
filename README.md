# RxBingMap
A reactive extension for the Bing web map plotting tool.
##Goal and Philosophy
<img align="right" width="370" height="295" src="https://cloud.githubusercontent.com/assets/7635865/9736052/fc4193f8-560c-11e5-82db-c23c91c05615.png"/>
RxBingMaps is an open-source RxJS binding for the [Bing Maps Ajax web API](https://msdn.microsoft.com/en-us/library/gg427610.aspx), which happens to nicely integrate with Bing core navigation and mapping services via the open source project [Rx-Bing-Services](https://github.com/erikschlegel/RxBingServices).<br>
<p>This project was implemented with simplicity and usability in mind, with providing users with a robust canvas and toolset to visualize a beautiful geo-map interface. In the example below, you can visualize custom pushpin icons to represent the results of the Bing spatial data(<i>whats around me</i>) REST service, and leveraging the RxJS to orchestrate all the asynch callbacks and event streams.</p>
![image](https://cloud.githubusercontent.com/assets/7635865/9719413/0923478a-5552-11e5-9c16-7b6a1fab3e95.gif)
<br>[RX-Bing-Maps Demo Site](http://rx-bing-maps-demo.azurewebsites.net/example/map.html)

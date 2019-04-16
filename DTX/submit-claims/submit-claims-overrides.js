/*
    submit-claims-overrides.js

    This file contains a number of overrides for functionality provided by claimSubmissionPage.js. The existing functions
    relied on a lot of IE specific XML/XPath behaviour. The comments below are on modified sections of the original functions.
    The changes made are to fix the functionality, no attempt has been made to clean up existing messes.
 */

/**
 * Creates an XMLDocument based on the projects that have been selected to claim against. This XML is used to obtain a
 * list of authorisers for each project, and once a validator and authoriser have been selected, this function is
 * called with includeItemList=true in order to generate the claim submission XML.
 *
 * @param includeItemList Include the items being claimed in the generated XML
 * @returns {*} an XMLDocument for <ProjectList>
 * @constructor
 */
XMLListOfProjects = function (includeItemList) {
    var xmlProjectList = parseXML("<ProjectList/>");
    document.getElementById("hdnCategorySurveyRequirements").value = "";

    var claim;

    // For each selected project in the table, create a '<Claims>' element with various child elements
    $(getProjectsTableList()).each(function (i) {
        selected = $(this).find("td").get(projectsColumnPositions.Selected);
        if (isSelected(selected)) {
            claim = xmlProjectList.createElement("Claims");

            claimID = xmlProjectList.createElement("ClaimID");
            employeeNumber = xmlProjectList.createElement("EmployeeNumber");
            projectCode = xmlProjectList.createElement("ProjectCode");
            period = xmlProjectList.createElement("Period");
            ratingCode = xmlProjectList.createElement("ComplianceRating");
            noReceipts = xmlProjectList.createElement("NoReceipts");
            noMissingReceipts = xmlProjectList.createElement("NoMissingReceipts");
            claimAmount = xmlProjectList.createElement("ClaimAmount");
            claimType = xmlProjectList.createElement("ClaimType");
            projectKey = xmlProjectList.createElement("ProjectKey");
            driverSurvey = xmlProjectList.createElement("DriverSurveyEmployeeSelected");
            networkUser = xmlProjectList.createElement("NetworkUser");

            // CHANGED - These assignments used to assign to 'element.text'. Chrome's XML serialiser expects element text to be
            // against 'element.textContent'. This section strips details from the table row and sticks it against
            // XML elements.
            projectCode.textContent = $($(this).find("td").get(projectsColumnPositions.Project_Code)).text();
            ratingCode.textContent = $($(this).find("td").get(projectsColumnPositions.Rating)).attr('rating');
            noReceipts.textContent = $($(this).find("td").get(projectsColumnPositions.Receipts)).find("input").attr("value");
            noMissingReceipts.textContent = $($(this).find("td").get(projectsColumnPositions.No_Receipts)).find("input").attr("value");
            claimAmount.textContent = $($(this).find("td").get(projectsColumnPositions.Amount)).text();
            claimType.textContent = $($(this).find("td").get(projectsColumnPositions.ClaimType)).text();
            projectKey.textContent = $($(this).find("td").get(projectsColumnPositions.ProjectKey)).text();


            if (claimType.textContent == "Expenses") {
                claimType.textContent = "NE";
            }
            else if (claimType.textContent == "Payroll") {
                claimType.textContent = "PV";
            }

            claim.appendChild(projectCode);
            claim.appendChild(employeeNumber);
            claim.appendChild(ratingCode);
            claim.appendChild(noReceipts);
            claim.appendChild(noMissingReceipts);
            claim.appendChild(claimAmount);
            claim.appendChild(claimType);
            claim.appendChild(projectKey);
            claim.appendChild(period);
            claim.appendChild(claimID);

            // Again, this is used for creating the final submission XML. This block adds all of the selected claim items
            // and applies selected validators and authorisers.
            if (includeItemList) {
                authoriser = xmlProjectList.createElement("Authoriser");
                projectManager = xmlProjectList.createElement("ProjectManager");
                authScrunity = xmlProjectList.createElement("AuthScrunity");

                authoriserCol = $(this).find("td").get(projectsColumnPositions.Authoriser);
                validatorCol = $(this).find("td").get(projectsColumnPositions.Validator);

                // CHANGED - More changes from '.text' to '.textContent'
                authoriser.textContent = $(authoriserCol).find("select option[selected]").attr('value');
                projectManager.textContent = $(validatorCol).find("select option[selected]").attr('value');

                claim.appendChild(authoriser);
                claim.appendChild(projectManager);

                authScrunity.textContent = "N";

                items = xmlProjectList.createElement("ClaimItems");

                $(getClaimItems()).each(function (i) {
                    claimItem = $(this);
                    selected = $(this).find("td").get(projectsColumnPositions.ItemSelected);
                    claimProjectKey = $(this).find("td").get(claimsColumnPositions.ProjectKey);
                    if (projectKey.textContent == $(claimProjectKey).text() && $(selected).find("input").attr('checked')) {
                        itemNode = xmlProjectList.createElement("Item");
                        itemNode.textContent = $($(claimItem).find("td").get(claimsColumnPositions.Item_ID)).text();

                        items.appendChild(itemNode);
                        claim.appendChild(items);
                        driver_survey = $($(claimItem).find("td").get(claimsColumnPositions.DRIVER_SURVEY)).text();
                        if (driver_survey == "Y")
                        {
                            document.getElementById("hdnCategorySurveyRequirements").value = "Y";
                        }
                    }

                });

                claim.appendChild(authScrunity);
                driverSurvey.textContent = DriverSurveyEmployeeSelect;
                claim.appendChild(driverSurvey);
                networkUser.textContent = document.getElementById("hdnnetworkuser").value;
                claim.appendChild(networkUser);
            }
            xmlProjectList.documentElement.appendChild(claim);
        }
    });

    return xmlProjectList;

};

/**
 * Handles the initialisation of the authorisers and validators step of the claim wizard. Lots of toggling of elements
 * happen here, but changes have only been made to the bottom of this function (XML Serialisation).
 */
setupAuthorisersAndValidatorsStep = function () {
    $("#btnSubmit").show();

    // show the select header
    $(getClaimItemTableHeaders()).each(function (i) {
        selected = $(this).find("th").get(claimsColumnPositions.ItemSelected);
        $(selected).hide();
    });

    // set the ratings of the projects based on the selections
    setProjectRatings();

    // hide the items not selected in the claim item table
    $(getClaimItems()).each(function (i) {
        claimItem = $(this);
        selectedCol = $(this).find("td").get(claimsColumnPositions.ItemSelected);
        if (!isSelected(selectedCol)) {
            $(claimItem).hide();

        }

        $(selectedCol).hide();
        $(claimItem).attr('deselected', true);
    });

    // show the validator, authoriser and rating columns in project list.
    $(projectsTableID + " thead tr").each(function (i) {

        validatorCol = $(this).find("th").get(projectsColumnPositions.Validator);
        $(validatorCol).show();

        authoriserCol = $(this).find("th").get(projectsColumnPositions.Authoriser);
        $(authoriserCol).show();

        ratingCol = $(this).find("th").get(projectsColumnPositions.Rating);
        $(ratingCol).show();


        noOfReceiptsCol = $(this).find("th").get(projectsColumnPositions.Receipts);
        $(noOfReceiptsCol).show();

        missingReceiptsCol = $(this).find("th").get(projectsColumnPositions.No_Receipts);
        $(missingReceiptsCol).show();

    });

    $(getProjectsTableList()).each(function (i) {
        validatorCol = $(this).find("td").get(projectsColumnPositions.Validator);
        $(validatorCol).show();
        $(validatorCol).find("select").show();

        authoriserCol = $(this).find("td").get(projectsColumnPositions.Authoriser);
        $(authoriserCol).show();
        $(authoriserCol).find("select").show();

        ratingCol = $(this).find("td").get(projectsColumnPositions.Rating);
        $(ratingCol).show();

        noOfReceiptsCol = $(this).find("td").get(projectsColumnPositions.Receipts);
        $(noOfReceiptsCol).show();

        missingReceiptsCol = $(this).find("td").get(projectsColumnPositions.No_Receipts);
        $(missingReceiptsCol).show();
    });

    toggleReadOnly(projectsTableID, projectsColumnPositions.Validator);
    toggleReadOnly(projectsTableID, projectsColumnPositions.Authoriser);


    // hide the claims not selected by the employee
    $(getProjectsTableList()).each(function (i) {
        claim = this;
        selected = $(this).find("td").get(projectsColumnPositions.Selected);

        if (!$(selected).find("input").attr('checked')) {
            $(claim).hide();
            $(claim).find("select").hide();
            $(claim).attr('deselected', true);
        }
        else {
            $(claim).show();
            $(claim).find("select").show();
        }

    });

    // CHANGED - Call our modified XMLListOfProjects function to get the projects list XML
    projectsTable = XMLListOfProjects(false);

    // CHANGED - IE exposes a 'projectsTable.xml' property which was then posted to DTX services. Chrome doesn't have this property
    // and relies on XMLSerializer for the the same kind of functionality. Without these changes the request to fetch the
    // authorisers list will fail, and an error is returned from DTX
    var xmlSerialiser = new XMLSerializer();
    httpSubmissionCollection = {
        'op': 'getAuthorisers',
        'xml': escape(xmlSerialiser.serializeToString(projectsTable))
    };
    $.post("./AjaxHandlers/ClaimSubmissionHandler.aspx", httpSubmissionCollection, function (data) {
        // We should now have been returned a version of the projectsTable XML that contains Authoriser elements
        setupAuthorisers(data);
    });
};


/**
 * This function deals with the XML returned from ClaimSubmissionHandler.aspx, and formats it in a way that can be used
 * by the <select> boxes present on the page.
 *
 * @param data XML returned by DTX that contains a list of authorisers for the various projects
 */
setupAuthorisers = function (data) {
    projectsTable = parseXML(data);
    var selectedAuthoriser;

    // For each project
    $(getProjectsTableList()).each(function (i) {
        projectKey = $(this).find("td").get(projectsColumnPositions.ProjectKey);

        // CHANGED - This was previously fetching an element from the projectsTable XML. This element would then have
        // a number of other properties pulled off via XPaths later on. Rather than doing this, a helper function has
        // been created to return an object that represents all of the information we need from a claim
        projectNode = getClaimByProjectKey($(projectKey).text());
        if (projectNode) {
            authoriserCol = $(this).find("td").get(projectsColumnPositions.Authoriser);
            selectedAuthoriser = $(authoriserCol).find("select option[selected]");

            selectedAuthoriserValue = $(selectedAuthoriser).attr('value');
            $(authoriserCol).find("nobr").html("");
            authorisers = new Array();
            selectAuthoriser = "";

            // CHANGE - Use the Claim object rather than XPaths to loop through authorisers
            for (var authCnt = 0; authCnt < projectNode.authorisers.length; authCnt++) {
                var authoriser = projectNode.authorisers[authCnt];

                // CHANGE - pull values from the Claim object
                personId = authoriser.personId;
                fullName = authoriser.fullName;
                if (personId == selectedAuthoriser.value) {
                    selectAuthoriser = personId;
                }
                authorisers[authorisers.length] = {PERSON_ID: personId, EMPLOYEE_NAME: fullName};
            }
            if (authorisers.length == 1 && selectedAuthoriserValue == "") {
                selectedAuthoriserValue = authorisers[0].PERSON_ID;
            }
            noItemsText = null;
            if (authorisers.length == 0) {
                noItemsText = "No Authoriser available for this claim.";
            }

            // This bit is where the formatted list of authorisers is used to populate the dropdowns
            initialiseDropDown(this, authoriserCol, "authoriser_" + i, 'authoriserList', authorisers, "EMPLOYEE_NAME", "PERSON_ID", null, null, selectedAuthoriserValue, noItemsText);
        }
    });
};

/**
 * This function is called when you click the 'submit claims' button, and have filled in all the dropdowns. It sends the
 * final XML over to DTX and returns any errors. If no errors are returned, the claim was successfully submitted and you
 * will be redirected to the MyClaims page.
 */
submitClaims = function () {
    var claimtypes = false;

    // CHANGE - Use modified function, use XMLSerialiser. True is passed to XMLListOfProjects so that the claims will be
    // added to the final XML
    projectsTable = XMLListOfProjects(true);
    var xmlSerialiser = new XMLSerializer();
    httpSubmissionCollection = {
        'op': 'submitClaims',
        'xml': escape(xmlSerialiser.serializeToString(projectsTable))
    };

    $.post("./AjaxHandlers/ClaimSubmissionHandler.aspx" , httpSubmissionCollection , function(data){
        // This is the returned data for your submission. ClaimID's will have been set on the elements, and this was
        // previously used to give you a little alert listing which claims have been created.
        projectsTable = parseXML( data );

        // CHANGE - This was an XPath check to see whether any error messages came back from submission
        if (projectsTable.querySelectorAll("ErrorMessage").length === 0 )
        {
            // CHANGE - this used to list out all the new ClaimID's that were created. It doesn't any more because I
            // couldn't face replacing all the XPath stuff. Now it just tells you that the claims were created.
            passThroughMessage = "Claims have been created";
            alert(passThroughMessage);

            // Redirect you to the MyClaims page
            window.location = "MyClaims.aspx";
        }
        else
        {
            // CHANGE - There used to be a block here that would strip the error messages off the XML and display
            // them in an alert. I removed this block... so now you just get a simple error warning.
            alert("There were errors with the claims submitted");
        }

    });
};

/**
 * New function created to replace XPath usage in the authoriser setup. It will take a project key and return a Claim model
 * that provides easy access to various properties from the XML
 *
 * @param projectKey
 * @returns {*} Claim model
 */
function getClaimByProjectKey(projectKey) {
    var claims = projectsTable.querySelectorAll('Claims');
    var claimModel;

    for (let i = 0; i < claims.length; i++) {
        const claim = claims[i];
        if (claim.querySelector('ProjectKey').textContent === projectKey) {
            claimModel = {
                projectCode: claim.querySelector('ProjectCode').textContent,
                employeeNumber: claim.querySelector('EmployeeNumber').textContent,
                complianceRating: claim.querySelector('ComplianceRating').textContent,
                noReceipts: claim.querySelector('NoReceipts').textContent,
                noMissingReceipts: claim.querySelector('NoMissingReceipts').textContent,
                claimAmount: claim.querySelector('ClaimAmount').textContent,
                claimType: claim.querySelector('ClaimType').textContent,
                projectKey: claim.querySelector('ProjectKey').textContent,
                period: claim.querySelector('Period').textContent,
                claimID: claim.querySelector('ClaimID').textContent
            };

            var authoriserNodes = claim.querySelectorAll('Authoriser');
            var authorisers = [];
            for (let j = 0; j < authoriserNodes.length; j++) {
                const authoriserNode = authoriserNodes[j];
                var authoriser = {
                    height: authoriserNode.getAttribute('height'),
                    personId: authoriserNode.getAttribute('person_id'),
                    employeeNumber: authoriserNode.getAttribute('employee_number'),
                    fullName: authoriserNode.getAttribute('full_name'),
                    lastName: authoriserNode.getAttribute('last_name'),
                    firstName: authoriserNode.getAttribute('first_name'),
                    emailAddress: authoriserNode.getAttribute('email_address')
                };
                authorisers.push(authoriser);
            }

            claimModel.authorisers = authorisers;
        }
    }

    return claimModel;
}